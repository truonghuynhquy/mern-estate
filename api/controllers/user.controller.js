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
    const { username, email, password, avatar } = req.body;

    let hashedPassword = null;
    if (password) {
      hashedPassword = bcryptjs.hashSync(password, 10);
    }
    console.log(password, hashedPassword);

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
    await Promise.all([
      await redis.set(`user:${req.params.id}`, JSON.stringify(userData[0])),
      redis.set(`user:${userData[0].email}`, req.params.id),
    ]);

    // Send response
    const { password: pass, ...rest } = userData[0];
    res.json({ success: true, data: rest });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== +req.params.id) {
    return next(new AppError("You can only delete your own account!", 401));
  }

  try {
    // Delete user in MySQL
    const deleteUser = await dbQuery.query("DELETE FROM users WHERE id = ?", [
      req.params.id,
    ]);

    const userRedis = await redis.get(`user:${req.params.id}`);
    const email = JSON.parse(userRedis).email;

    await Promise.all([
      redis.del(`user:${req.params.id}`),
      redis.del(`user:${email}`),
    ]);

    // Check if any user was deleted
    if (deleteUser.affectedRows === 0) {
      return next(new AppError("User not found", 404));
    }

    res.clearCookie("access_token");
    res.status(200).json("User has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (req.user.id === +req.params.id) {
    try {
      let listings = await redis.get(`listing:${+req.params.id}`);
      if (listings) {
        listing = [JSON.parse(listing)];
      } else {
        listings = await dbQuery.query(
          "SELECT * FROM listings WHERE userRef =?",
          [req.params.id]
        );
      }

      res.json({ success: true, data: listings });
    } catch (error) {
      next(error);
    }
  } else {
    return next(new AppError("You can only view your own listings!", 401));
  }
};

export const getUser = async (req, res, next) => {
  try {
    let user = await redis.get(`user:${+req.params.id}`);
    if (user) {
      user = JSON.parse(user);
    } else {
      const userDB = await dbQuery.query("SELECT * FROM users WHERE id =?", [
        req.params.id,
      ]);

      if (userDB.length === 0) {
        return next(new AppError("User not found", 404));
      }

      user = userDB[0];
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
