import { pool } from "./dbConnection.js";

export const dbQuery = {
    query: async (sql, values) => {
        try {
            // TODO: Get a connection from the pool
            const connection = await pool.getConnection();
            // Execute the query
            const [results, fields] = await connection.execute(sql, values);
            connection.release(); // COMMENT: Release the connection after use
            return results;
        } catch (error) {
            throw error;
        }
    },
    close: () => {
        console.log("Close connection");
        pool.end();
    },
};
