import {
  Association, DataTypes, HasManyAddAssociationMixin, HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, HasManyHasAssociationMixin,
  HasManySetAssociationsMixin, HasManyAddAssociationsMixin, HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, Model, ModelDefined, Optional,
  Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute, ForeignKey,
} from 'sequelize';

import db from "../util/db";
import Family from './family';
import Image from './image';

// const Species = db.define("species", {
//   id: {
//     type: Sequelize.INTEGER,
//     primaryKey: true,
//     allowNull: false,
//     autoIncrement: true,
//   },
//   name: Sequelize.STRING,
//   latinName: {
//     type: Sequelize.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   maxSizeMilimeters: Sequelize.INTEGER,
//   appearanceDesc: Sequelize.TEXT("long"),
//   lifestyleDesc: Sequelize.TEXT("long"),
//   resources: Sequelize.STRING,
// });

class Spider extends Model<InferAttributes<Spider>, InferCreationAttributes<Spider>> {
  declare id: CreationOptional<number>;
  declare name: string | null;
  declare latinName: string;
  declare appearanceDesc: string | null;
  declare behaviorDesc: string | null;
  declare resources: string | null;

  declare familyId: ForeignKey<Family['id']>;
  declare family?: NonAttribute<Family>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare getImage: HasManyGetAssociationsMixin<Image>;
  declare addImage: HasManyAddAssociationMixin<Image, number>;
  declare addImages: HasManyAddAssociationsMixin<Image, number>;
  declare setImage: HasManySetAssociationsMixin<Image, number>;
  declare removeImage: HasManyRemoveAssociationMixin<Image, number>;
  declare removeImages: HasManyRemoveAssociationsMixin<Image, number>;
  declare hasImage: HasManyHasAssociationMixin<Image, number>;
  declare hasImages: HasManyHasAssociationsMixin<Image, number>;
  declare countImage: HasManyCountAssociationsMixin;
  declare createImage: HasManyCreateAssociationMixin<Image>;

  declare images?: NonAttribute<Image[]>;

  declare public static associations: { images: Association<Spider, Image> };
}

Spider.init( 
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
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, 
  {
    tableName: "spiders", 
    sequelize: db
  });

export default Spider;
