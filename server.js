import express from "express";
import cors from "cors";
import morgan from "morgan";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 8000;

// Directory setup for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = path.join(__dirname, 'uploads');

// Ensure upload directory exists
import fs from 'fs';
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

// Set up storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory); // Directory to save the uploaded files
  },
  filename: (req, file, cb) => {
    // Append original file extension
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Create the multer instance with the storage configuration
const upload = multer({ storage });

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

// Endpoint to handle image uploads
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: "error", message: "No file uploaded." });
  }
  res.status(200).json({ status: "success", message: `File uploaded successfully: ${req.file.path}` });
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
