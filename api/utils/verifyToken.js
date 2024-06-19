import jwt from "jsonwebtoken";
import redis from "../database/redisClient.js";
import AppError from "../utils/appError.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return next(new AppError("Unauthorized", 401));
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    const userRedis = await redis.get(`user:${userId}`);
    if (!userRedis) {
      return next(new AppError("Unauthorized", 401));
    }

    req.user = JSON.parse(userRedis);
    next();
  } catch (error) {
    next(new AppError("Unauthorized", 401));
  }
};
