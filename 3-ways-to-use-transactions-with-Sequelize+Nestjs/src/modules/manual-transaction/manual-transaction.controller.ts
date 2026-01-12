import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize, Transaction } from 'sequelize';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { ManualTransactionService } from './manual-transaction.service.js';
import { CreateUserBody, createUserSchema } from './dto/create-user.dto.js';
import { CreateDepartmentBody, createDepartmentSchema } from './dto/create-department.dto.js';
import {
  DepartmentStatusBody,
  departmentStatusSchema,
} from './dto/department-status.dto.js';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe.js';

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
  async createUser(@Body(new ZodValidationPipe(createUserSchema)) body: CreateUserBody) {
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
  async createDepartment(@Body(new ZodValidationPipe(createDepartmentSchema)) body: CreateDepartmentBody) {
    return this.runInTransaction((transaction) => this.service.createDepartment(body, transaction));
  }

  @Patch('departments/:id/status')
  @ApiOperation({ summary: 'Update department status' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: DepartmentStatusBody })
  async deactivateDepartment(
    @Param('id', ParseIntPipe) departmentId: number,
    @Body(new ZodValidationPipe(departmentStatusSchema)) body: DepartmentStatusBody
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
