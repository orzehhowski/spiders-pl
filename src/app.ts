import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import path from "path";
import multer from "multer";
import bodyParser from "body-parser";

import familyRoutes from "./routes/family";
import spiderRoutes from "./routes/spider";
import initalSeed from "./seed/initalSeed";
import Family from "./models/family";
import Spider from "./models/spider";
import Image from "./models/image";
import errorMiddleware from "./errors/errorMiddleware";

const app = express();
app.set("view engine", "ejs");

const fileStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, path.join("src", "public", "img"));
  },
  filename(req, file, callback) {
    callback(null, new Date().toISOString() + "-" + file.originalname);
  },
});

// MIDDLEWARES

app.use((req, res, next) => {
  res.locals = {
    title: "",
  };
  next();
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

// ERROR MIDDLEWARES

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
});
app.use(errorMiddleware);

// DB RELATIONS

Family.hasMany(Spider, {
  sourceKey: "id",
  foreignKey: "familyId",
  as: "spiders",
});

Spider.hasMany(Image, {
  sourceKey: "id",
  foreignKey: "spiderId",
  as: "images",
});

// RUNNING APP

initalSeed()
  .then(() => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
