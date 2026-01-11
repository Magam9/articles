import { Column, CreatedAt, DataType, Model, Table, UpdatedAt } from 'sequelize-typescript';

import { DepartmentCreationAttributes, IDepartment } from './department.typings.js';

@Table({
  tableName: 'departments',
})
export class DepartmentModel extends Model<IDepartment, DepartmentCreationAttributes> implements IDepartment {
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

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
