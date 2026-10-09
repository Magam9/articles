import { Injectable } from '@nestjs/common';

import { UsersDepartmentsDao } from '../dao/users-departments.dao.js';
import { UserDepartmentCreationAttributes } from '../models/user-department.typings.js';
import { TransactionOptions } from '../dao/dao.typings.js';

@Injectable()
export class UsersDepartmentsRepository {
  constructor(
    private readonly usersDepartmentsDao: UsersDepartmentsDao,
  ) {}

  async create(data: UserDepartmentCreationAttributes, options: TransactionOptions = {}) {
    const result = await this.usersDepartmentsDao.create(data, options);
    return result.toJSON();
  }

  removeUserFromAllDepartments(userId: number, options: TransactionOptions = {}) {
    return this.usersDepartmentsDao.destroyByConditions(
      { usersDepartmentsConditions: { userId } },
      options,
    );
  }

  removeAllUsersFromDepartment(departmentId: number, options: TransactionOptions = {}) {
    return this.usersDepartmentsDao.destroyByConditions(
      { usersDepartmentsConditions: { departmentId } },
      options,
    );
  }
}
