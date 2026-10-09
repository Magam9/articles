import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';

import { UsersRepository } from '../../repositories/users.repository.js';
import { DepartmentsRepository } from '../../repositories/departments.repository.js';
import { UsersDepartmentsRepository } from '../../repositories/users-departments.repository.js';

interface CreateUserPayload {
  name: string;
  email: string;
}

interface CreateDepartmentPayload {
  name: string;
}

interface DepartmentStatusPayload {
  action: 'deactivation';
}

interface CreateUserDepartmentPayload {
  userId: number;
  departmentId: number;
}

@Injectable()
export class InterceptorTransactionService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly departmentsRepository: DepartmentsRepository,
    private readonly usersDepartmentsRepository: UsersDepartmentsRepository,
  ) {}

  async createUser(payload: CreateUserPayload, transaction: Transaction) {
    await this.usersRepository.create({ ...payload, deactivatedAt: null }, { transaction });
  }

  async deactivateUser(userId: number, transaction: Transaction) {
    await this.usersRepository.deactivate(userId, { transaction });
    await this.usersDepartmentsRepository.removeUserFromAllDepartments(userId, { transaction });
  }

  async createDepartment(payload: CreateDepartmentPayload, transaction: Transaction) {
    await this.departmentsRepository.create(payload, { transaction });
  }

  async deactivateDepartment(
    departmentId: number,
    payload: DepartmentStatusPayload,
    transaction: Transaction
  ) {
    if (payload.action === 'deactivation') {
      await this.usersDepartmentsRepository.removeAllUsersFromDepartment(departmentId, { transaction });
    }
  }

  async createUserDepartment(payload: CreateUserDepartmentPayload, transaction: Transaction) {
    await this.usersDepartmentsRepository.create(payload, { transaction });
  }
}
