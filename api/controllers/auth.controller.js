import { dbQuery } from "../database/dbQuery.js";
import { isValidEmail } from "../utils/validation.js";

export const signup = async (req, res) => {
    const { username, email, password } = req.body;

    if (!isValidEmail(email)) {
        console.log("Invalid Email");
        return;
    }

    const createUserQuery = `
        INSERT INTO users (username, email, password)
        VALUES (?,?,?)
    `;
    try {
        const result = await dbQuery.query(createUserQuery, [
            username,
            email,
            password,
        ]);

        const userId = result.insertId;
        const userData = await dbQuery.query(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );

        res.status(201).json({
            status: "Success",
            data: {
                userData,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: "Fail",
            data: error.message,
        });
    }
};
