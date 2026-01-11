import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { UnitOfWorkService } from './unit-of-work.service';

interface CreateUserBody {
  name: string;
  email: string;
}

interface CreateDepartmentBody {
  name: string;
}

@Controller('unit-of-work')
export class UnitOfWorkController {
  constructor(private readonly service: UnitOfWorkService) {}

  @Post('users')
  async createUser(@Body() body: CreateUserBody) {
    await this.service.createUser(body);
    return { status: 'committed' };
  }

  @Patch('users/:id/deactivate')
  async deactivateUser(@Param('id', ParseIntPipe) userId: number) {
    await this.service.deactivateUser(userId);
    return { status: 'committed' };
  }

  @Post('departments')
  async createDepartment(@Body() body: CreateDepartmentBody) {
    await this.service.createDepartment(body);
    return { status: 'committed' };
  }

  @Patch('departments/:id/deactivate')
  async deactivateDepartment(@Param('id', ParseIntPipe) departmentId: number) {
    await this.service.deactivateDepartment(departmentId);
    return { status: 'committed' };
  }

  @Post('users/:userId/departments/:departmentId')
  async createUserDepartment(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('departmentId', ParseIntPipe) departmentId: number
  ) {
    await this.service.createUserDepartment({ userId, departmentId });
    return { status: 'committed' };
  }
}
