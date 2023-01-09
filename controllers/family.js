const Family = require("../models/family");
const Species = require("../models/species");
const Image = require("../models/image");
const err = require("../util/errorclg");

module.exports.getAbout = (req, res, next) => {
  const id = +req.params.id;
  let header;
  let latinName;
  let appearanceDesc;
  let lifestyleDesc;
  let resources;
  Family.findByPk(id)
    .then((family) => {
      if (!family) {
        next();
      }
      header = family.name;
      latinName = family.latinName;
      appearanceDesc = family.appearanceDesc;
      lifestyleDesc = family.lifestyleDesc;
      resources = family.resources ? family.resources.split(" ") : [];
      return Species.findAll({
        where: { familyId: family.id },
        include: Image,
      }).then((species) => {
        res.render("main/familyPage", {
          header,
          latinName,
          appearanceDesc,
          lifestyleDesc,
          resources,
          species,
        });
      });
    })
    .catch(err);
};
