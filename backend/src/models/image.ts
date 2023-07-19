// this model represents image saved in filesystem - contains path and author
import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  AllowNull,
  BelongsTo,
} from "sequelize-typescript";
import Spider from "./spider";
import Family from "./family";
import Suggestion from "./suggestion";

@Table
export default class Image extends Model {
  @AllowNull(false)
  @Column
  src!: string;

  @Column
  author?: string;

  @ForeignKey(() => Spider)
  @Column
  spiderId?: number;

  @BelongsTo(() => Spider)
  spider?: Spider;

  @ForeignKey(() => Family)
  @Column
  familyId?: number;

  @BelongsTo(() => Family)
  family?: Family;

  @ForeignKey(() => Suggestion)
  @Column
  suggestionId?: number;

  @BelongsTo(() => Suggestion)
  suggestion?: Suggestion;

  @CreatedAt
  createdAt?: string;

  @UpdatedAt
  updatedAt?: string;
}
