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
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import Spider from "./spider";
import User from "./user";

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

  @ForeignKey(() => User)
  @Column
  userId!: number;

  @BelongsTo(() => User)
  user?: User;

  @CreatedAt
  createdAt?: string;

  @UpdatedAt
  updatedAt?: string;
}
