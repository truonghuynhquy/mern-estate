import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbQuery } from "../database/dbQuery.js";
import { isValidEmail } from "../utils/validation.js";
import AppError from "../utils/appError.js";
import redis from "../database/redisClient.js";

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
    let userData = await redis.get(`user:${email}`);
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
      await redis.set(`user:${email}`, JSON.stringify(userData)); // Lưu trữ trong Redis
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
    console.log(rest);

    res.cookie("access_token", token, { httpOnly: true }).status(201).json({
      token,
      success: true,
      data: rest,
    });
  } catch (error) {
    next(error);
  }
};
