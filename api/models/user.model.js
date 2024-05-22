// models/User.js
import { dbConnection } from "../database/dbConnection.js";
import dotenv from "dotenv";

dotenv.config({ path: "../config.env" });

export const createUserTable = async () => {
    const checkTableQuery = `
        SELECT COUNT(*) AS tableCount FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = ?
    `;
    const tableName = "users";
    const databaseName = process.env.DATABASE;

    try {
        // Check if the table already exists in the database
        const [rows, fields] = await dbConnection.query(checkTableQuery, [
            databaseName,
            tableName,
        ]);

        console.log(rows);
        const tableCount = rows.tableCount;

        // If the table does not exist, create a new one
        if (tableCount === 0) {
            const createTableQuery = `
                CREATE TABLE users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL UNIQUE,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    avatar VARCHAR(255) DEFAULT 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `;
            await dbConnection.query(createTableQuery);
            console.log('Table "users" created successfully');
        } else {
            console.log('Table "users" already exists');
        }
    } catch (error) {
        console.error("Error creating table:", error);
    } finally {
        dbConnection.close();
    }
};
