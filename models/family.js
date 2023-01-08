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
  },
  latinName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  appearanceDesc: Sequelize.TEXT("long"),
  lifestyleDesc: Sequelize.TEXT("long"),
});

module.exports = Family;
