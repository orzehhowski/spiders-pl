import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  AllowNull,
  Unique,
  BelongsTo,
} from "sequelize-typescript";
import Spider from "./spider";

@Table
export default class Image extends Model {
  @AllowNull(false)
  @Unique(true)
  @Column
  src!: string;

  @Column
  author?: string;

  @ForeignKey(() => Spider)
  @Column
  spiderId!: number;

  @BelongsTo(() => Spider)
  spider?: Spider;

  @CreatedAt
  createdAt?: string;

  @UpdatedAt
  updatedAt?: string;
}
