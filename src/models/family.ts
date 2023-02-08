import {
  Association,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationsMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from "sequelize";

import db from "../util/db";
import Spider from "./spider";

class Family extends Model<
  InferAttributes<Family>,
  InferCreationAttributes<Family>
> {
  declare id: CreationOptional<number>;
  declare name: string | null;
  declare latinName: string;
  declare appearanceDesc: string | null;
  declare behaviorDesc: string | null;
  declare resources: string | null;
  declare image: string | null;
  declare imageAuthor: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare getSpider: HasManyGetAssociationsMixin<Spider>;
  declare addSpider: HasManyAddAssociationMixin<Spider, number>;
  declare addSpiders: HasManyAddAssociationsMixin<Spider, number>;
  declare setSpiders: HasManySetAssociationsMixin<Spider, number>;
  declare removeSpider: HasManyRemoveAssociationMixin<Spider, number>;
  declare removeSpiders: HasManyRemoveAssociationsMixin<Spider, number>;
  declare hasSpider: HasManyHasAssociationMixin<Spider, number>;
  declare hasSpiders: HasManyHasAssociationsMixin<Spider, number>;
  declare countSpiders: HasManyCountAssociationsMixin;
  declare createSpider: HasManyCreateAssociationMixin<Spider, "familyId">;

  declare spiders?: NonAttribute<Spider[]>;

  declare static associations: { spiders: Association<Family, Spider> };
}

Family.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    latinName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    appearanceDesc: new DataTypes.TEXT("long"),
    behaviorDesc: new DataTypes.TEXT("long"),
    resources: new DataTypes.STRING(1024),
    image: DataTypes.STRING,
    imageAuthor: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "families",
    sequelize: db,
  }
);

export default Family;
