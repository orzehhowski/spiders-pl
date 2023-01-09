const Sequelize = require("sequelize");

const db = require("../util/db");

const Image = db.define("image", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  src: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  author: Sequelize.STRING,
});

module.exports = Image;
