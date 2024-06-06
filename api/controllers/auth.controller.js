import bcryptjs from "bcryptjs";
import { dbQuery } from "../database/dbQuery.js";
import { isValidEmail } from "../utils/validation.js";
import AppError from "../utils/appError.js";

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
    // NOTE: Find user into database by email
    const userData = await dbQuery.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (userData.length === 0) {
      return next(new AppError("User not found", 404));
    }
    const validPassword = await bcryptjs.compare(
      password,
      userData[0].password
    );

    if (!validPassword) {
      return next(new AppError("Invalid Password", 401));
    }

    const { password: pass, ...rest } = userData[0];
    console.log(rest);

    res.status(201).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
