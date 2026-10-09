import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { WhereOptions } from 'sequelize';

import { UserDepartmentModel } from '../models/user-department.model.js';
import { IUserDepartment, UserDepartmentCreationAttributes } from '../models/user-department.typings.js';
import { TransactionOptions } from './dao.typings.js';

@Injectable()
export class UsersDepartmentsDao {
  constructor(
    @InjectModel(UserDepartmentModel)
    private userDepartmentModel: typeof UserDepartmentModel
  ) {}

  create(data: UserDepartmentCreationAttributes, options: TransactionOptions = {}) {
    return this.userDepartmentModel.create(data, options);
  }

  updateByConditions(conditions: {
    usersDepartmentsConditions: Partial<UserDepartmentCreationAttributes>,
  }, data: Partial<UserDepartmentCreationAttributes>, options: TransactionOptions = {}) {
    return this.userDepartmentModel.update(data, {
      ...options,
      where: conditions.usersDepartmentsConditions,
    });
  }

  destroyByConditions(conditions: {
    usersDepartmentsConditions: WhereOptions<IUserDepartment>,
  }, options: TransactionOptions = {}) {
    return this.userDepartmentModel.destroy({
      ...options,
      where: conditions.usersDepartmentsConditions,
    });
  }
}
