import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  HasMany,
  AllowNull,
  Unique,
} from "sequelize-typescript";
import Spider from "./spider";

@Table
export default class Family extends Model {
  @Unique(true)
  @Column
  name?: string;

  @AllowNull(false)
  @Unique(true)
  @Column
  latinName!: string;

  @Column(DataType.TEXT)
  appearanceDesc?: string;

  @Column(DataType.TEXT)
  behaviorDesc?: string;

  @Column(DataType.TEXT)
  resources?: string;

  @Column
  image!: string;

  @Column
  imageAuthor?: string;

  @HasMany(() => Spider)
  spiders?: Spider[];

  @CreatedAt
  createdAt?: string;

  @UpdatedAt
  updatedAt?: string;
}
