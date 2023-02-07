require("dotenv").config();

import express from "express";
import path from "path";

import mainRoutes from "./routes/main";
import familyRoutes from "./routes/family";
import speciesRoutes from "./routes/species";
import errors from "./controllers/error";
import db from "./util/db";
import Family from "./models/family";
import Species from "./models/spider";
import Image from "./models/image";

const app = express();

app.set("view engine", "ejs");

// MIDDLEWARES

app.use((req, res, next) => {
  res.locals = {
    title: "",
  };
  next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use(mainRoutes);
app.use("/family", familyRoutes);
app.use("/species", speciesRoutes);
app.use(errors.error404);

// DB RELATIONS

Family.hasMany(Species);
Species.belongsTo(Family);

Species.hasMany(Image);
Image.belongsTo(Species);

// RUNNING APP

// db.sync()
db.sync({ force: true })
  .then(async () => {
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
        .then((species) => {
          Image.bulkCreate([
            {
              src: "/img/krzyzak.jpg",
              author: "Bartosz Orzechowski",
              spiderId: 1,
            },
            {
              src: "/img/krzyzak2.jpg",
              author: "Bartosz Orzechowski",
              spiderId: 1,
            },
          ]).then(() => {
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
                .then((species) => {
                  species.createImage({
                    src: "/img/pajak1.jpg",
                    author: "Bartosz Orzechowski",
                  });
                });
            });
            app.listen(3000);
          });
        });
    });
  })
  .catch((err) => {
    console.log(err);
  });
