import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize, Transaction } from 'sequelize';

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
  constructor(@InjectConnection() private readonly sequelize: Sequelize) {}

  private async runUseCase(work: (transaction: Transaction) => Promise<void>) {
    await this.sequelize.transaction(async (transaction) => {
      await work(transaction);
    });
  }

  async createUser(payload: CreateUserPayload) {
    await this.runUseCase(async (transaction) => {
      void payload;
      void transaction;
    });
  }

  async deactivateUser(userId: number) {
    await this.runUseCase(async (transaction) => {
      void userId;
      void transaction;
    });
  }

  async createDepartment(payload: CreateDepartmentPayload) {
    await this.runUseCase(async (transaction) => {
      void payload;
      void transaction;
    });
  }

  async deactivateDepartment(departmentId: number, payload: DepartmentStatusPayload) {
    await this.runUseCase(async (transaction) => {
      void departmentId;
      void payload;
      void transaction;
    });
  }

  async createUserDepartment(payload: CreateUserDepartmentPayload) {
    await this.runUseCase(async (transaction) => {
      void payload;
      void transaction;
    });
  }
}
