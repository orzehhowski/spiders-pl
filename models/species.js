const Sequelize = require("sequelize");

const db = require("../util/db");

const Species = db.define("species", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
  latinName: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  maxSizeMilimeters: Sequelize.INTEGER,
  appearanceDesc: Sequelize.TEXT("long"),
  lifestyleDesc: Sequelize.TEXT("long"),
  resources: Sequelize.STRING,
});

module.exports = Species;
