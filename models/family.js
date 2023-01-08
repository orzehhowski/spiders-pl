const Sequelize = require("sequelize");

const db = require("../util/db");

const Family = db.define("family", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true,
  },
  latinName: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  appearanceDesc: Sequelize.TEXT("long"),
  lifestyleDesc: Sequelize.TEXT("long"),
  resources: Sequelize.STRING,
  image: Sequelize.STRING,
});

module.exports = Family;
