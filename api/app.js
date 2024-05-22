import express from "express";
import morgan from "morgan";

import { checkMySQLConnection } from "./database/dbConnection.js";

const app = express();
app.use(express.json());
app.use(morgan("dev"));

checkMySQLConnection();

export default app;
