// database.js
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config({ path: "./api/config.env" });

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.ROOT,
    password: process.env.PASSWORD || "",
    database: process.env.DATABASE,
});

export const dbConnection = {
    query: (sql, values) => {
        return new Promise((resolve, reject) => {
            connection.query(sql, values, (error, results, fields) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    },
    close: () => {
        connection.end();
    },
};

export function checkMySQLConnection() {
    connection.connect((err) => {
        if (err) {
            console.error("Error connecting to MySQL:", err.stack);
            return;
        }
        console.log("Connected to MySQL");
    });
}
