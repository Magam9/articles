import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize, Transaction } from 'sequelize';
import { ApiBody, ApiOperation, ApiParam, ApiProperty, ApiTags } from '@nestjs/swagger';

import { ManualTransactionService } from './manual-transaction.service.js';

class CreateUserBody {
  @ApiProperty({ example: 'Ada Lovelace' })
  name!: string;

  @ApiProperty({ example: 'ada@company.test' })
  email!: string;
}

class CreateDepartmentBody {
  @ApiProperty({ example: 'Engineering' })
  name!: string;
}

class DepartmentStatusBody {
  @ApiProperty({ enum: ['deactivation'] })
  action!: 'deactivation';
}

@Controller('manual-transaction')
@ApiTags('manual-transaction')
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
  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({ type: CreateUserBody })
  async createUser(@Body() body: CreateUserBody) {
    return this.runInTransaction((transaction) => this.service.createUser(body, transaction));
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiParam({ name: 'id', type: Number })
  async deactivateUser(@Param('id', ParseIntPipe) userId: number) {
    return this.runInTransaction((transaction) => this.service.deactivateUser(userId, transaction));
  }

  @Post('departments')
  @ApiOperation({ summary: 'Create a department' })
  @ApiBody({ type: CreateDepartmentBody })
  async createDepartment(@Body() body: CreateDepartmentBody) {
    return this.runInTransaction((transaction) => this.service.createDepartment(body, transaction));
  }

  @Patch('departments/:id/status')
  @ApiOperation({ summary: 'Update department status' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: DepartmentStatusBody })
  async deactivateDepartment(
    @Param('id', ParseIntPipe) departmentId: number,
    @Body() body: DepartmentStatusBody
  ) {
    return this.runInTransaction((transaction) =>
      this.service.deactivateDepartment(departmentId, body, transaction)
    );
  }

  @Post('users/:userId/departments/:departmentId')
  @ApiOperation({ summary: 'Create a user department' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiParam({ name: 'departmentId', type: Number })
  async createUserDepartment(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('departmentId', ParseIntPipe) departmentId: number
  ) {
    return this.runInTransaction((transaction) =>
      this.service.createUserDepartment({ userId, departmentId }, transaction)
    );
  }
}
