import app from "./app.js";
import { createListingTable } from "./models/listing.model.js";
import { createUserTable } from "./models/user.model.js";

createUserTable();
createListingTable();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
