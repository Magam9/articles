import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize, Transaction } from 'sequelize';

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
export class UnitOfWorkService {
  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly usersRepository: UsersRepository,
    private readonly departmentsRepository: DepartmentsRepository,
    private readonly usersDepartmentsRepository: UsersDepartmentsRepository,
  ) {}

  private runUseCase<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return this.sequelize.transaction((transaction) => work(transaction));
  }

  async createUser(payload: CreateUserPayload) {
    return this.runUseCase((transaction) =>
      this.usersRepository.create({ ...payload, deactivatedAt: null }, { transaction }),
    );
  }

  async createUserInDepartment(payload: CreateUserPayload, departmentId: number) {
    return this.runUseCase(async (transaction) => {
      const user = await this.usersRepository.create(
        { ...payload, deactivatedAt: null },
        { transaction },
      );

      await this.usersDepartmentsRepository.create(
        { userId: user.id, departmentId },
        { transaction },
      );

      return user;
    });
  }

  async deactivateUser(userId: number) {
    await this.runUseCase(async (transaction) => {
      await this.usersRepository.deactivate(userId, { transaction });
      await this.usersDepartmentsRepository.removeUserFromAllDepartments(userId, { transaction });
    });
  }

  async createDepartment(payload: CreateDepartmentPayload) {
    return this.runUseCase((transaction) =>
      this.departmentsRepository.create(payload, { transaction }),
    );
  }

  async deactivateDepartment(departmentId: number, payload: DepartmentStatusPayload) {
    await this.runUseCase(async (transaction) => {
      if (payload.action === 'deactivation') {
        await this.usersDepartmentsRepository.removeAllUsersFromDepartment(departmentId, { transaction });
      }
    });
  }

  async createUserDepartment(payload: CreateUserDepartmentPayload) {
    return this.runUseCase((transaction) =>
      this.usersDepartmentsRepository.create(payload, { transaction }),
    );
  }
}
