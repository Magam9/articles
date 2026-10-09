import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UsersDao } from './users.dao.js';
import { DepartmentsDao } from './departments.dao.js';
import { UsersDepartmentsDao } from './users-departments.dao.js';
import { DepartmentModel } from '../models/department.model.js';
import { UserModel } from '../models/user.model.js';
import { UserDepartmentModel } from '../models/user-department.model.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserModel,
      DepartmentModel,
      UserDepartmentModel,
    ]),
  ],
  providers: [UsersDao, DepartmentsDao, UsersDepartmentsDao],
  exports: [UsersDao, DepartmentsDao, UsersDepartmentsDao],
})
export class DaoModule {}
