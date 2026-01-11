import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize, Transaction } from 'sequelize';
import { ManualTransactionService } from './manual-transaction.service';

interface CreateUserBody {
  name: string;
  email: string;
}

interface CreateDepartmentBody {
  name: string;
}

interface DepartmentStatusBody {
  action: 'deactivation';
}

@Controller('manual-transaction')
export class ManualTransactionController {
  constructor(
    private readonly service: ManualTransactionService,
    @InjectConnection()
    private readonly sequelize: Sequelize
  ) {}

  private async runInTransaction(work: (transaction: Transaction) => Promise<void>) {
    const transaction = await this.sequelize.transaction();

    try {
      await work(transaction);
      await transaction.commit();
      return { status: 'committed' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  @Post('users')
  async createUser(@Body() body: CreateUserBody) {
    return this.runInTransaction((transaction) => this.service.createUser(body, transaction));
  }

  @Patch('users/:id/deactivate')
  async deactivateUser(@Param('id', ParseIntPipe) userId: number) {
    return this.runInTransaction((transaction) => this.service.deactivateUser(userId, transaction));
  }

  @Post('departments')
  async createDepartment(@Body() body: CreateDepartmentBody) {
    return this.runInTransaction((transaction) => this.service.createDepartment(body, transaction));
  }

  @Patch('departments/:id/status')
  async deactivateDepartment(
    @Param('id', ParseIntPipe) departmentId: number,
    @Body() body: DepartmentStatusBody
  ) {
    return this.runInTransaction((transaction) =>
      this.service.deactivateDepartment(departmentId, body, transaction)
    );
  }

  @Post('users/:userId/departments/:departmentId')
  async createUserDepartment(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('departmentId', ParseIntPipe) departmentId: number
  ) {
    return this.runInTransaction((transaction) =>
      this.service.createUserDepartment({ userId, departmentId }, transaction)
    );
  }
}
