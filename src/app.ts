import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import path from "path";
import multer from "multer";
import bodyParser from "body-parser";

import familyRoutes from "./routes/family";
import spiderRoutes from "./routes/spider";
import imageRoutes from "./routes/image";
import adminRoutes from "./routes/admin";
import authRoutes from "./routes/auth";
import ownerRoutes from "./routes/owner";
// import initalSeed from "./util/initalSeed";
import errorMiddleware from "./errors/errorMiddleware";

const app = express();

const fileStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, path.join("src", "public", "img"));
  },
  filename(req, file, callback) {
    callback(null, new Date().toISOString() + "-" + file.originalname);
  },
});

// body parsers
app.use(bodyParser.json());
app.use(
  multer({
    storage: fileStorage,
    fileFilter: (req, file, callback) => {
      if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg"
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
  }).single("image")
);

// static folders
app.use(express.static(path.join(__dirname, "public")));

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ROUTES

app.use("/family", familyRoutes);
app.use("/spider", spiderRoutes);
app.use("/image", imageRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/sudo", ownerRoutes);

// ERROR MIDDLEWARES

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Not found." });
});
app.use(errorMiddleware);

// RUNNING APP

// initalSeed()
//   .then(() => {
//     app.listen(8080);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

export default app;
