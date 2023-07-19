// this file handles connection to database
import mysql from "mysql2";
import { Sequelize } from "sequelize-typescript";
import Spider from "../models/spider";
import Family from "../models/family";
import Image from "../models/image";
import User from "../models/user";
import Suggestion from "../models/suggestion";
import Source from "../models/source";

interface Options {
  isTesting?: boolean;
}

const initSequelize = (options?: Options) => {
  // set correct database name
  const dbName = options?.isTesting ? "test_spiders_pl" : "spiders_pl";

  // establish connection
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  // this connection only creates database in case it doesn't exist yet
  connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, function (err) {
    err && console.log(err);
  });

  connection.end();

  // and here appropiate sequelize object is created
  return new Sequelize({
    database: dbName,
    username: process.env.DB_USERNAME,
    dialect: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    password: process.env.DB_PASSWORD,
    models: [Family, Spider, Image, User, Suggestion, Source],
    logging: options?.isTesting ? false : (sql) => console.log(sql),
  });
};

export default initSequelize;
