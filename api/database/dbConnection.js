// database.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: "./api/config.env" });

export const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.ROOT,
    password: process.env.PASSWORD || "",
    database: process.env.DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export async function checkMySQLConnection() {
    try {
        // Get a connection from the pool
        const connection = await pool.getConnection();
        console.log("Connected to MySQL");
        connection.release(); // Release the connection after use
    } catch (err) {
        console.error("Error connecting to MySQL:", err.stack);
    }
}
