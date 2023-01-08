const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "spiders_pl",
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    dialect: "mysql",
    host: "localhost",
  }
);

module.exports = sequelize;
