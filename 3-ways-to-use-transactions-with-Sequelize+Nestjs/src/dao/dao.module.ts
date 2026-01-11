import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UsersDao } from './users.dao.js';
import { DepartmentsDao } from './departments.dao.js';
import { DepartmentModel } from '../models/department.model.js';
import { UserModel } from '../models/user.model.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserModel,
      DepartmentModel,
    ]),
  ],
  providers: [UsersDao, DepartmentsDao],
  exports: [UsersDao, DepartmentsDao],
})
export class DaoModule {}
