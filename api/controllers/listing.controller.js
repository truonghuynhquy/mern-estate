import { dbQuery } from "../database/dbQuery.js";
import redis from "../database/redisClient.js";

export const createListing = async (req, res, next) => {
  try {
    const valuesArray = Object.values({
      ...req.body,
      imageUrls: JSON.stringify(req.body.imageUrls),
    });
    console.log(valuesArray);

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
    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
};
