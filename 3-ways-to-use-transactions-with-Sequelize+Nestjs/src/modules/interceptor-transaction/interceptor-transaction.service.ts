import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';

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
  async createUser(payload: CreateUserPayload, transaction: Transaction) {
    void payload;
    void transaction;
  }

  async deactivateUser(userId: number, transaction: Transaction) {
    void userId;
    void transaction;
  }

  async createDepartment(payload: CreateDepartmentPayload, transaction: Transaction) {
    void payload;
    void transaction;
  }

  async deactivateDepartment(
    departmentId: number,
    payload: DepartmentStatusPayload,
    transaction: Transaction
  ) {
    void departmentId;
    void payload;
    void transaction;
  }

  async createUserDepartment(payload: CreateUserDepartmentPayload, transaction: Transaction) {
    void payload;
    void transaction;
  }
}
