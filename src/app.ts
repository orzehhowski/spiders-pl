import dotenv from "dotenv"
dotenv.config();

import express, { Request, Response } from "express";
import path from "path";
import multer from "multer";
import bodyParser from "body-parser";

import familyRoutes from "./routes/family";
import spiderRoutes from "./routes/spider";
import db from "./util/db";
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
  as: "spiders"
});

Spider.hasMany(Image, {
  sourceKey: "id",
  foreignKey: "spiderId",
  as: "images",
});

// RUNNING APP

db.sync()
  // db.sync({ force: true })
  .then(async () => {
<<<<<<< HEAD
    // await Family.create({
    //   name: "krzyżakowate",
    //   latinName: "araneidae",
    //   appearanceDesc:
    //     "majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krpie majom <br/>krzyz upie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na majomrzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz dupie",
    //   behaviorDesc: "robią dwuwymiarowe sieci",
    //   image: "/img/krzyzak.jpg",
    //   imageAuthor: "Bartosz Orzechowski",
    //   resources:
    //     "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate https://arages.de/files/checklist2004_araneae.pdf",
    // }).then((family) => {
    //   family
    //     .createSpider({
    //       name: "krzyzak ogrodowy",
    //       latinName: "araneidae ogrodae",
    //       appearanceDesc: "ladny jest",
    //       behaviorDesc: "sieci plecie",
    //       resources: "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate",
    //     })
    //     .then((spider) => {
    //       spider
    //         .createImage({
    //           src: "/img/krzyzak.jpg",
    //           author: "Bartosz Orzechowski",
    //         })
    //         .then(() => {
    //           Family.create({
    //             name: "kwadratnikowate",
    //             latinName: "Tetragnathidae",
    //             image: "/img/pajak1.jpg",
    //             imageAuthor: "Bartosz Orzechowski",
    //           }).then((family) => {
    //             family
    //               .createSpider({
    //                 latinName: "Metellina segmentata",
    //               })
    //               .then((spider) => {
    //                 spider.createImage({
    //                   src: "/img/pajak1.jpg",
    //                   author: "Bartosz Orzechowski",
    //                 });
    //               });
    //           });
    app.listen(8080);
    // });
    //       });
    //   });
=======
    await Family.create({
      name: "krzyżakowate",
      latinName: "araneidae",
      appearanceDesc:
        "majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krpie majom <br/>krzyz upie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na majomrzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz dupie",
      behaviorDesc: "robią dwuwymiarowe sieci",
      image: "/img/krzyzak.jpg",
      imageAuthor: "Bartosz Orzechowski",
      resources:
        "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate https://arages.de/files/checklist2004_araneae.pdf",
    }).then((family) => {
      family
        .createSpider({
          name: "krzyzak ogrodowy",
          latinName: "araneidae ogrodae",
          appearanceDesc: "ladny jest",
          behaviorDesc: "sieci plecie",
          resources: "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate",
        })
        .then((spider) => {
          spider.createImage(
            {
              src: "/img/krzyzak.jpg",
              author: "Bartosz Orzechowski",
            }).then(() => {
            Family.create({
              name: "kwadratnikowate",
              latinName: "Tetragnathidae",
              image: "/img/pajak1.jpg",
              imageAuthor: "Bartosz Orzechowski",
            }).then((family) => {
              family
                .createSpider({
                  latinName: "Metellina segmentata",
                })
                .then((spider) => {
                  spider.createImage({
                    src: "/img/pajak1.jpg",
                    author: "Bartosz Orzechowski",
                  });
                });
            });
            app.listen(3000);
          });
        });
    });
>>>>>>> parent of 1e59d6e (elsint + prettier done)
  })
  .catch((err) => {
    console.log(err);
  });
