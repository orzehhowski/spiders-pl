import { Sequelize } from "sequelize-typescript";
import Spider from "../models/spider";
import Family from "../models/family";
import Image from "../models/image";
import User from "../models/user";
import Suggestion from "../models/suggestion";

const initSequelize = (isTesting?: boolean) => {
  return new Sequelize({
    database: isTesting ? "test_spiders_pl" : "spiders_pl",
    username: process.env.DB_USERNAME,
    dialect: "mysql",
    host: "localhost",
    password: process.env.DB_PASSWORD,
    models: [Family, Spider, Image, User, Suggestion],
  });
};

export default initSequelize;
