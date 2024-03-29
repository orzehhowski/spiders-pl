// this model represents spider species
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
import User from "./user";
import Source from "./source";

@Table
export default class Spider extends Model {
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

  @HasMany(() => Source)
  sources?: Source[];

  // user that suggested creation
  @ForeignKey(() => User)
  @Column
  userId!: number;

  @BelongsTo(() => User, { foreignKey: "userId" })
  user?: User;

  // Admin that accepted creation
  @ForeignKey(() => User)
  @Column
  adminId!: number;

  @BelongsTo(() => User, { foreignKey: "adminId" })
  admin?: User;

  @ForeignKey(() => Family)
  @Column
  familyId!: number;

  @BelongsTo(() => Family)
  family?: Family;

  @HasMany(() => Image, { onDelete: "SET NULL" })
  images?: Image[];

  @CreatedAt
  createdAt?: string;

  @UpdatedAt
  updatedAt?: string;
}
