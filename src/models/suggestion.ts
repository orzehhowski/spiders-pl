/* 
Suggestion model is for a non-admin users suggestions of editing or adding sources. 
Request will be shown in admin panel, and admin can improve data and accept request or
reject it. 
*/
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasOne,
} from "sequelize-typescript";
import User from "./user";
import Image from "./image";

@Table
export default class Suggestion extends Model {
  @Column
  isNew!: boolean;

  @Column
  isFamily!: boolean;

  // only for create spider suggestions
  @Column
  familyId?: number;

  // only for update suggestions
  @Column
  resourceId?: number;

  @Column
  accepted?: boolean;

  @Column
  rejected?: boolean;

  @Column
  name?: string;

  @Column
  latinName!: string;

  @Column(DataType.TEXT)
  appearanceDesc?: string;

  @Column(DataType.TEXT)
  behaviorDesc?: string;

  @Column(DataType.TEXT)
  sources?: string;

  @HasOne(() => Image)
  image?: Image;

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
