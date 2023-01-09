const Species = require("../models/species");
const Image = require("../models/image");

module.exports.getAbout = (req, res, next) => {
  Species.findByPk(+req.params.id, { include: Image }).then((spider) => {
    res.render("main/speciesPage", {
      title: spider.name || spider.latinName,
      header: spider.name,
      latinName: spider.latinName,
      appearanceDesc: spider.appearanceDesc,
      lifestyleDesc: spider.lifestyleDesc,
      resources: spider.resources ? spider.resources.split(" ") : [],
      gallery: spider.images,
    });
  });
};
