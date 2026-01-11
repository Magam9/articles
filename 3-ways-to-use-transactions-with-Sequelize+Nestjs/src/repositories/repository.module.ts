import { Module } from '@nestjs/common';

import { DaoModule } from '../dao/dao.module.js';
import { UsersRepository } from './users.repository.js';
import { DepartmentsRepository } from './departments.repository.js';
import { UsersDepartmentsRepository } from './users-departments.repository.js';

@Module({
  imports: [DaoModule],
  providers: [
    UsersRepository,
    DepartmentsRepository,
    UsersDepartmentsRepository,
  ],
  exports: [
    UsersRepository,
    DepartmentsRepository,
    UsersDepartmentsRepository,
  ],
})
export class RepositoryModule {}
