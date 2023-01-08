const Family = require("../models/family");
const err = require("../util/errorclg");

module.exports.getHome = (req, res, next) => {
  Family.findAll()
    .then((families) => {
      res.render("main/home", {
        families,
        title: "Polskie Pająki",
        header: "Rodziny",
      });
    })
    .catch(err);
};
