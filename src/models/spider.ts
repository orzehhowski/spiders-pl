import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  AllowNull,
  Unique,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import Family from "./family";
import Image from "./image";

@Table
export default class Spider extends Model {
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

  @ForeignKey(() => Family)
  @Column
  familyId!: number;

  @BelongsTo(() => Family)
  family?: Family;

  @HasMany(() => Image)
  images?: Image[];

  @CreatedAt
  createdAt?: string;

  @UpdatedAt
  updatedAt?: string;
}
