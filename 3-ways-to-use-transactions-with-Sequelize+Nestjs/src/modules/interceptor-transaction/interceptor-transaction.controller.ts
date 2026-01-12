import { Body, Controller, Param, ParseIntPipe, Patch, Post, UseInterceptors } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransactionInterceptor } from './transaction.interceptor.js';
import { DbTransaction } from './transaction.decorator.js';
import { InterceptorTransactionService } from './interceptor-transaction.service.js';
import { CreateUserBody, createUserSchema } from './dto/create-user.dto.js';
import { CreateDepartmentBody, createDepartmentSchema } from './dto/create-department.dto.js';
import {
  DepartmentStatusBody,
  departmentStatusSchema,
} from './dto/department-status.dto.js';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe.js';

@Controller('interceptor-transaction')
@UseInterceptors(TransactionInterceptor)
@ApiTags('interceptor-transaction')
export class InterceptorTransactionController {
  constructor(private readonly service: InterceptorTransactionService) {}

  @Post('users')
  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({ type: CreateUserBody })
  async createUser(
    @Body(new ZodValidationPipe(createUserSchema)) body: CreateUserBody,
    @DbTransaction() transaction: Transaction
  ) {
    await this.service.createUser(body, transaction);
    return { status: 'committed' };
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiParam({ name: 'id', type: Number })
  async deactivateUser(
    @Param('id', ParseIntPipe) userId: number,
    @DbTransaction() transaction: Transaction
  ) {
    await this.service.deactivateUser(userId, transaction);
    return { status: 'committed' };
  }

  @Post('departments')
  @ApiOperation({ summary: 'Create a department' })
  @ApiBody({ type: CreateDepartmentBody })
  async createDepartment(
    @Body(new ZodValidationPipe(createDepartmentSchema)) body: CreateDepartmentBody,
    @DbTransaction() transaction: Transaction
  ) {
    await this.service.createDepartment(body, transaction);
    return { status: 'committed' };
  }

  @Patch('departments/:id/status')
  @ApiOperation({ summary: 'Update department status' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: DepartmentStatusBody })
  async deactivateDepartment(
    @Param('id', ParseIntPipe) departmentId: number,
    @Body(new ZodValidationPipe(departmentStatusSchema)) body: DepartmentStatusBody,
    @DbTransaction() transaction: Transaction
  ) {
    await this.service.deactivateDepartment(departmentId, body, transaction);
    return { status: 'committed' };
  }

  @Post('users/:userId/departments/:departmentId')
  @ApiOperation({ summary: 'Create a user department' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiParam({ name: 'departmentId', type: Number })
  async createUserDepartment(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @DbTransaction() transaction: Transaction
  ) {
    await this.service.createUserDepartment({ userId, departmentId }, transaction);
    return { status: 'committed' };
  }
}
