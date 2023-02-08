import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  ForeignKey,
} from "sequelize";

import db from "../util/db";
import Spider from "./spider";

class Image extends Model<
  InferAttributes<Image>,
  InferCreationAttributes<Image>
> {
  declare id: CreationOptional<number>;
  declare src: string;
  declare author: string;

  declare spiderId: ForeignKey<Spider["id"]>;
  declare spider?: NonAttribute<Spider>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Image.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    src: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "images",
    sequelize: db,
  }
);

export default Image;
