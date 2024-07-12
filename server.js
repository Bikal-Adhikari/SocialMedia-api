import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 8000;

import { connectDb } from "./src/config/dbConfig.js";
connectDb();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import routers from "./src/routers/routers.js";
routers.forEach(({ path, middlewares }) => app.use(path, ...middlewares));

app.get("/", (req, res, next) => {
  res.json({
    status: "success",
    message: "server is live",
  });
});

app.use("*", (req, res, next) => {
  const err = new Error("404 Page nto found");
  err.statusCode = 404;
  next(err);
});

app.use((error, req, res, next) => {
  console.log(error, "--------");

  res.status(error.statusCode || 500);
  res.json({
    status: "error",
    message: error.message,
  });
});

app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`server is running at http://localhost:${PORT}`);
});
