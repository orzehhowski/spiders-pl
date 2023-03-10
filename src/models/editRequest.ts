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
