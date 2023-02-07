import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "spiders_pl",
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    dialect: "mysql",
    host: "localhost",
  }
);

export default sequelize;
