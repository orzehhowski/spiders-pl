import mysql from "mysql2";
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
  const dbName = options?.isTesting ? "test_spiders_pl" : "spiders_pl";

  const connection = mysql.createConnection({
    host: "sql_db",
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, function (err) {
    err && console.log(err);
  });

  connection.end();

  return new Sequelize({
    database: dbName,
    username: process.env.DB_USERNAME,
    dialect: "mysql",
    host: "sql_db",
    port: parseInt(process.env.DB_PORT || "3306"),
    password: process.env.DB_PASSWORD,
    models: [Family, Spider, Image, User, Suggestion],
    logging: options?.isTesting ? false : (sql) => console.log(sql),
  });
};

export default initSequelize;