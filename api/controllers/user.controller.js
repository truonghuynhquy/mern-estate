import bcryptjs from "bcryptjs";
import { dbQuery } from "../database/dbQuery.js";
import redis from "../database/redisClient.js";
import AppError from "../utils/appError.js";

export const test = (req, res) => {
  res.json({ message: "API route is working" });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== +req.params.id) {
    return next(new AppError("You can only update your own account!", 401));
  }
  try {
    const { username, email, pass, avatar } = req.body;

    let hashedPassword = null;

    if (pass) {
      hashedPassword = bcryptjs.hashSync(pass, 10);
    }

    // Update user in MySQL with conditional updates
    const sql = `
      UPDATE users
      SET 
        username = IFNULL(?, username),
        email = IFNULL(?, email),
        password = IFNULL(?, password),
        avatar = IFNULL(?, avatar)
      WHERE id = ?
    `;

    // Ensure that parameters are not undefined, replace with null if necessary
    const queryParams = [
      username || null,
      email || null,
      hashedPassword || null,
      avatar || null,
      req.params.id,
    ];

    const updateUser = await dbQuery.query(sql, queryParams);

    // Check if any user was updated
    if (updateUser.affectedRows === 0) {
      return next(new AppError("User not found", 404));
    }

    const userData = await dbQuery.query("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);

    // Save users in Redis
    await redis.set(`user:${req.params.id}`, JSON.stringify(userData[0]));
    const { password, ...rest } = userData[0];
    res.json({ status: "success", data: rest });
  } catch (error) {
    next(error);
  }
};
