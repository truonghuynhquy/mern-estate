import express from "express";
import morgan from "morgan";

import userRouter from "./routes/user.route.js";
import { checkMySQLConnection } from "./database/dbConnection.js";

const app = express();
app.use(express.json());
app.use(morgan("dev"));

checkMySQLConnection();

app.use("/api/user", userRouter);

export default app;
