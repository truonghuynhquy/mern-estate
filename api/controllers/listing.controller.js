import { dbQuery } from "../database/dbQuery.js";
import redis from "../database/redisClient.js";
import AppError from "../utils/appError.js";

export const createListing = async (req, res, next) => {
  try {
    const valuesArray = Object.values({
      ...req.body,
      imageUrls: JSON.stringify(req.body.imageUrls),
    });

    const insertQuery = `
      INSERT INTO listings (name, description, address, regularPrice, discountPrice, bathrooms, bedrooms, furnished, parking, type, offer, imageUrls, userRef)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
    const result = await dbQuery.query(insertQuery, valuesArray);
    const listingId = result.insertId;
    const data = await dbQuery.query(`SELECT * FROM listings WHERE id =?`, [
      listingId,
    ]);

    await redis.set(`listing:${listingId}`, JSON.stringify(data[0]));
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listingRedis = await redis.get(`listing:${req.params.id}`);
    const idUser = JSON.parse(listingRedis).userRef;

    if (req.user.id !== +idUser) {
      return next(new AppError("You can only delete your own listings!", 401));
    }

    const deleteListing = await dbQuery.query(
      "DELETE FROM listings WHERE id =?",
      [req.params.id]
    );

    await redis.del(`listing:${req.params.id}`);

    if (deleteListing.affectedRows === 0) {
      return next(new AppError("Listing not found", 404));
    }

    res.status(200).json("Listing has been deleted!");
  } catch (error) {
    next(error);
  }
};
