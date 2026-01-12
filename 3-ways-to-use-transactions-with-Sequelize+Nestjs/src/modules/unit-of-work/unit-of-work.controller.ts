import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { UnitOfWorkService } from './unit-of-work.service.js';
import { CreateUserBody, createUserSchema } from './dto/create-user.dto.js';
import { CreateDepartmentBody, createDepartmentSchema } from './dto/create-department.dto.js';
import {
  DepartmentStatusBody,
  departmentStatusSchema,
} from './dto/department-status.dto.js';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe.js';

@Controller('unit-of-work')
@ApiTags('unit-of-work')
export class UnitOfWorkController {
  constructor(private readonly service: UnitOfWorkService) {}

  @Post('users')
  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({ type: CreateUserBody })
  async createUser(@Body(new ZodValidationPipe(createUserSchema)) body: CreateUserBody) {
    await this.service.createUser(body);
    return { status: 'committed' };
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiParam({ name: 'id', type: Number })
  async deactivateUser(@Param('id', ParseIntPipe) userId: number) {
    await this.service.deactivateUser(userId);
    return { status: 'committed' };
  }

  @Post('departments')
  @ApiOperation({ summary: 'Create a department' })
  @ApiBody({ type: CreateDepartmentBody })
  async createDepartment(@Body(new ZodValidationPipe(createDepartmentSchema)) body: CreateDepartmentBody) {
    await this.service.createDepartment(body);
    return { status: 'committed' };
  }

  @Patch('departments/:id/status')
  @ApiOperation({ summary: 'Update department status' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: DepartmentStatusBody })
  async deactivateDepartment(
    @Param('id', ParseIntPipe) departmentId: number,
    @Body(new ZodValidationPipe(departmentStatusSchema)) body: DepartmentStatusBody
  ) {
    await this.service.deactivateDepartment(departmentId, body);
    return { status: 'committed' };
  }

  @Post('users/:userId/departments/:departmentId')
  @ApiOperation({ summary: 'Create a user department' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiParam({ name: 'departmentId', type: Number })
  async createUserDepartment(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('departmentId', ParseIntPipe) departmentId: number
  ) {
    await this.service.createUserDepartment({ userId, departmentId });
    return { status: 'committed' };
  }
}
