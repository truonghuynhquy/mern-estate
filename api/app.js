import express from "express";
import morgan from "morgan";

import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import { checkMySQLConnection } from "./database/dbConnection.js";

const app = express();
app.use(express.json());
app.use(morgan("dev"));

checkMySQLConnection();

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

export default app;
