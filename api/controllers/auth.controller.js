import bcryptjs from "bcryptjs";
import { dbQuery } from "../database/dbQuery.js";
import { isValidEmail } from "../utils/validation.js";
import AppError from "../utils/appError.js";

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcryptjs.hashSync(password, 10);

    if (!isValidEmail(email)) {
        return next(new AppError("Invalid Email", 400));
    }

    const createUserQuery = `
        INSERT INTO users (username, email, password)
        VALUES (?,?,?)
    `;
    try {
        const result = await dbQuery.query(createUserQuery, [
            username,
            email,
            hashedPassword,
        ]);

        const userId = result.insertId;
        const userData = await dbQuery.query(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );

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
