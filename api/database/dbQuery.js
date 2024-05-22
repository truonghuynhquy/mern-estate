import { connection } from "./dbConnection.js";

export const dbQuery = {
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
