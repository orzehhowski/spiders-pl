import {
  Column,
  Model,
  Table,
  Unique,
  AllowNull,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import Suggestion from "./suggestion";
import Family from "./family";
import Spider from "./spider";

@Table
export default class User extends Model {
  @Unique(true)
  @AllowNull(false)
  @Column
  email!: string;

  @AllowNull(false)
  @Column
  passwordHash!: string;

  @Column
  username?: string;

  @Column
  isAdmin?: boolean;

  @Column
  isBanned?: boolean;

  @Column
  token?: string;

  @Column
  tokenExpiration?: string;

  @HasMany(() => Spider)
  spiders?: Spider[];

  @HasMany(() => Family)
  families?: Family[];

  @HasMany(() => Suggestion)
  suggestions?: Suggestion[];

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
