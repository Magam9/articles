import { Injectable } from '@nestjs/common';

import { DepartmentsDao } from '../dao/departments.dao.js';
import { DepartmentCreationAttributes } from 'src/models/department.typings.js';
import { TransactionOptions } from '../dao/dao.typings.js';

@Injectable()
export class DepartmentsRepository {
  constructor(
    private readonly departmentsDao: DepartmentsDao,
  ) {}

  async create(data: DepartmentCreationAttributes, options: TransactionOptions = {}) {
    const result = await this.departmentsDao.create(data, options);
    return result.toJSON();
  }
}
