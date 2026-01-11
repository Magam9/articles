import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { DepartmentModel } from '../models/department.model.js';
import { DepartmentCreationAttributes } from '../models/department.typings.js';
import { TransactionOptions } from './dao.typings.js';

@Injectable()
export class DepartmentsDao {
  constructor(
    @InjectModel(DepartmentModel) private departmentModel: typeof DepartmentModel,
  ) {}

  create(data: DepartmentCreationAttributes, options: TransactionOptions = {}) {
    return this.departmentModel.create(data, options);
  }

  updateByConditions(conditions: {
    departmentsConditions: Partial<DepartmentCreationAttributes>,
  }, data: Partial<DepartmentCreationAttributes>, options: TransactionOptions = {}) {
    return this.departmentModel.update(data, {
      ...options,
      where: conditions.departmentsConditions,
    });
  }
}
