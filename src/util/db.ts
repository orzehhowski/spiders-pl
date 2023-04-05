import { Sequelize } from "sequelize-typescript";
import Spider from "../models/spider";
import Family from "../models/family";
import Image from "../models/image";
import User from "../models/user";
import Suggestion from "../models/suggestion";

interface Options {
  isTesting?: boolean;
}

const initSequelize = (options?: Options) => {
  return new Sequelize({
    database: options?.isTesting ? "test_spiders_pl" : "spiders_pl",
    username: process.env.DB_USERNAME,
    dialect: "mysql",
    host: "localhost",
    password: process.env.DB_PASSWORD,
    models: [Family, Spider, Image, User, Suggestion],
    logging: !options?.isTesting,
  });
};

export default initSequelize;
