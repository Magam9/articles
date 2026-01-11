import { Column, CreatedAt, DataType, Model, Table, UpdatedAt } from 'sequelize-typescript';

import { IUser, UserCreationAttributes } from './user.typings.js';

@Table({
  tableName: 'users',
})
export class UserModel extends Model<IUser, UserCreationAttributes> implements IUser {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.DATE,
    field: 'deactivated_at',
    allowNull: true,
  })
  declare deactivatedAt: IUser['deactivatedAt'];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
  
