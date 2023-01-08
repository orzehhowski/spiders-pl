const Sequelize = require("sequelize");

const db = require("../util/db");

const Species = db.define("species", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  latinName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  maxSizeMilimeters: Sequelize.INTEGER,
  minSizeMilimeters: Sequelize.INTEGER,
  appearanceDesc: Sequelize.TEXT("long"),
  lifestyleDesc: Sequelize.TEXT("long"),
  resources: Sequelize.STRING,
  image: Sequelize.STRING,
});

module.exports = Species;
