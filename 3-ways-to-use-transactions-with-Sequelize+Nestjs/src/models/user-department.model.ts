import { Column, CreatedAt, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { IUserDepartment, UserDepartmentCreationAttributes } from './user-department.typings.js';
import { UserModel } from './user.model.js';
import { DepartmentModel } from './department.model.js';

@Table({
  tableName: 'users_departments',
  updatedAt: false,
})
export class UserDepartmentModel extends Model<IUserDepartment, UserDepartmentCreationAttributes> implements IUserDepartment {
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    field: 'user_id',
  })
  declare userId: number;
  
  @ForeignKey(() => DepartmentModel)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    field: 'department_id',
  })
  declare departmentId: number;
  
  @CreatedAt
  declare createdAt: Date;
}
