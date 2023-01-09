require("dotenv").config();

const express = require("express");
const path = require("path");

const mainRoutes = require("./routes/main");
const familyRoutes = require("./routes/family");
const speciesRoutes = require("./routes/species");
const errors = require("./controllers/error");
const db = require("./util/db");
const Family = require("./models/family");
const Species = require("./models/species");
const Image = require("./models/image");

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
      lifestyleDesc: "robią dwuwymiarowe sieci",
      image: "/img/krzyzak.jpg",
      imageAuthor: "Bartosz Orzechowski",
      resources:
        "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate https://arages.de/files/checklist2004_araneae.pdf",
    }).then((family) => {
      family
        .createSpecies({
          name: "krzyzak ogrodowy",
          latinName: "araneidae ogrodae",
          appearanceDesc: "ladny jest",
          lifestyleDesc: "sieci plecie",
          resources: "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate",
          maxSizeMilimeters: 20,
        })
        .then((species) => {
          Image.bulkCreate([
            {
              src: "/img/krzyzak.jpg",
              author: "Bartosz Orzechowski",
              speciesId: 1,
            },
            {
              src: "/img/krzyzak2.jpg",
              author: "Bartosz Orzechowski",
              speciesId: 1,
            },
          ]).then(() => {
            Family.create({
              name: "kwadratnikowate",
              latinName: "Tetragnathidae",
              image: "/img/pajak1.jpg",
              imageAuthor: "Bartosz Orzechowski",
            }).then((family) => {
              family
                .createSpecies({
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
