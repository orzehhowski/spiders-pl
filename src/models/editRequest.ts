/* 
EditRequest model is for a non-admin users suggestions of editing or adding resources. 
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
} from "sequelize-typescript";
import User from "./user";

@Table
export default class EditRequest extends Model {
  @Column
  isNew!: boolean;

  @Column
  isFamily!: boolean;

  @Column
  resourceId?: number;

  @Column
  accepted?: boolean;

  @Column
  name?: string;

  @Column
  latinName!: string;

  @Column(DataType.TEXT)
  appearanceDesc?: string;

  @Column(DataType.TEXT)
  behaviorDesc?: string;

  @Column(DataType.TEXT)
  resources?: string;

  @Column
  imageAuthor?: string;

  @Column
  image?: string;

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
