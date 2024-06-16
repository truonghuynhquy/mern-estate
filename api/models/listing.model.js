import { dbQuery } from "../database/dbQuery.js";

export const createListingTable = async () => {
  const checkTableQuery = `
    SELECT COUNT(*) AS tableCount FROM information_schema.tables 
    WHERE table_schema = ? AND table_name = ?
  `;

  const tableName = "listings";
  const databaseName = process.env.DATABASE;

  try {
    // Check if the table already exists in the database
    const [rows, fields] = await dbQuery.query(checkTableQuery, [
      databaseName,
      tableName,
    ]);

    const tableCount = rows.tableCount;
    // If the table does not exist, create a new one
    if (tableCount === 0) {
      const createTableQuery = `
        CREATE TABLE listings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          address VARCHAR(255) NOT NULL,
          regularPrice DECIMAL(10, 2) NOT NULL,
          discountPrice DECIMAL(10, 2) NOT NULL,
          bathrooms INT NOT NULL,
          bedrooms INT NOT NULL,
          furnished BOOLEAN NOT NULL,
          parking BOOLEAN NOT NULL,
          type VARCHAR(255) NOT NULL,
          offer BOOLEAN NOT NULL,
          imageUrls TEXT NOT NULL,
          userRef VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      await dbQuery.query(createTableQuery);
      console.log('Table "listings" created successfully');
    } else {
      console.log('Table "listings" already exists in the database');
    }
  } catch (error) {
    console.error("Error creating table:", error);
  }
};
