import express from "express";
import morgan from "morgan";

import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import { checkMySQLConnection } from "./database/dbConnection.js";
import globalErrorHandler from "./controllers/error.controller.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

checkMySQLConnection();

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

app.use(globalErrorHandler);

export default app;
