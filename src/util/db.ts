import { Sequelize } from "sequelize-typescript";
import Spider from "../models/spider";
import Family from "../models/family";
import Image from "../models/image";

const sequelize = new Sequelize({
  database: "spiders_pl",
  username: process.env.DB_USERNAME,
  dialect: "mysql",
  host: "localhost",
  password: process.env.DB_PASSWORD,
  models: [Family, Spider, Image],
});

export default sequelize;
