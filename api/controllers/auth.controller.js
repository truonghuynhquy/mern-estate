import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbQuery } from "../database/dbQuery.js";
import { isValidEmail } from "../utils/validation.js";
import AppError from "../utils/appError.js";
import redis from "../database/redisClient.js";

// Use to remove accents from string
function removeAccents(str) {
  return str
    .normalize("NFD") // Normalize the string to signed form
    .replace(/[\u0300-\u036f]/g, "") // Remove word marks
    .toLowerCase(); // Convert to lowercase
}

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!isValidEmail(email)) {
    return next(new AppError("Invalid Email", 400));
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const createUserQuery = `
            INSERT INTO users (username, email, password)
            VALUES (?,?,?)
        `;

    const result = await dbQuery.query(createUserQuery, [
      username,
      email,
      hashedPassword,
    ]);

    const userId = result.insertId;
    const userData = await dbQuery.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    // Save users in Redis
    await redis.set(`user:${userId}`, JSON.stringify(userData[0]));

    res.status(201).json({
      success: true,
      data: {
        userData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find users in Redis first
    const resultRedis = await redis.get(`user:${email}`);
    const userRedisResult = JSON.parse(resultRedis);
    const redisId = userRedisResult.id;

    let userData = await redis.get(`user:${redisId}`);

    if (userData) {
      userData = JSON.parse(userData); // If available in Redis, parse JSON from Redis
    } else {
      // If not in Redis, search in database
      const dbUserData = await dbQuery.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      if (dbUserData.length === 0) {
        return next(new AppError("User not found", 404));
      }
      userData = dbUserData[0];

      // Store users into Redis
      await redis.set(`user:${userData.id}`, JSON.stringify(userData)); // Lưu trữ trong Redis
    }

    // Check password
    const validPassword = await bcryptjs.compare(password, userData.password);

    if (!validPassword) {
      return next(new AppError("Invalid Password", 401));
    }

    // Create JWT Token
    const token = jwt.sign({ id: userData.id }, process.env.JWT_SECRET);

    // Returns user information (excluding password)
    const { password: pass, ...rest } = userData;

    res.cookie("access_token", token, { httpOnly: true }).status(201).json({
      token,
      success: true,
      data: rest,
    });
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { name, email, photo } = req.body;

  try {
    // Search for users in Redis first
    let userData = await redis.get(`user:${email}`);

    if (userData) {
      // If available in Redis, parse JSON
      userData = JSON.parse(userData);
    } else {
      // If available in Redis, parse JSON
      const dbUserData = await dbQuery.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (dbUserData.length === 0) {
        // If not found in the database, create a new user
        const generatedPassword =
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8);
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(generatedPassword, salt);

        const insertResult = await dbQuery.query(
          "INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)",
          [
            removeAccents(name).split(" ").join("").toLowerCase() +
              Math.random().toString(36).slice(-4),
            email,
            hashedPassword,
            photo,
          ]
        );

        const userId = insertResult.insertId;

        // Get new user information from the database
        const [newUserData] = await dbQuery.query(
          "SELECT * FROM users WHERE id = ?",
          [userId]
        );
        userData = newUserData;
      } else {
        userData = dbUserData[0];
      }
      // Save user information to Redis
      await redis.set(`user:${email}`, JSON.stringify(userData));
    }

    // Generate JWT tokens
    const token = jwt.sign({ id: userData.id }, process.env.JWT_SECRET);

    // Returns user information (password excluded)
    const { password, ...rest } = userData;

    res.cookie("access_token", token, { httpOnly: true }).status(200).json({
      token,
      success: true,
      data: rest,
    });
  } catch (error) {
    next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return next(new AppError("No token found!", 401));
    }

    // Decode token to get user id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Remove user from Redis
    await redis.del(`user:${userId}`);

    // Remove token from cookies
    res.clearCookie("access_token");
    res.status(200).json("User has been logged out!");
  } catch (error) {
    next(error);
  }
};
