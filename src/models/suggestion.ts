/* 
Suggestion model is for a non-admin users suggestions of editing or adding resources. 
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
  name?: string;

  @Column
  latinName!: string;

  @Column(DataType.TEXT)
  appearanceDesc?: string;

  @Column(DataType.TEXT)
  behaviorDesc?: string;

  @Column(DataType.TEXT)
  resources?: string;

  // only for family suggestions
  @Column
  imageAuthor?: string;

  // only for family suggestions
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
