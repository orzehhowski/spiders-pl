// this model represents spiders family - animal taxomony unit
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  HasMany,
  HasOne,
  AllowNull,
  Unique,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import Spider from "./spider";
import User from "./user";
import Image from "./image";
import Source from "./source";

@Table
export default class Family extends Model {
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

  @HasOne(() => Image)
  image!: Image;

  @HasMany(() => Spider)
  spiders?: Spider[];

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

  @CreatedAt
  createdAt?: string;

  @UpdatedAt
  updatedAt?: string;
}
