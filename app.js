require("dotenv").config();

const express = require("express");
const path = require("path");

const mainRoutes = require("./routes/main");
const errors = require("./controllers/error");
const db = require("./util/db");
const Family = require("./models/family");
const Species = require("./models/species");

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
app.use(errors.error404);

// DB RELATIONS

Family.hasMany(Species);
Species.belongsTo(Family);

db
  // .sync()
  .sync({ force: true })
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
