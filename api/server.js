import app from "./app.js";
import { createUserTable } from "./models/user.model.js";

createUserTable();

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
