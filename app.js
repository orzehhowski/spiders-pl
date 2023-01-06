const express = require("express");

const mainRoutes = require("./routes/main");
const errors = require("./controllers/error");

const app = express();

app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.locals = {
    title: "",
  };
  next();
});

app.use(mainRoutes);
app.use(errors.error404);

app.listen(3000);
