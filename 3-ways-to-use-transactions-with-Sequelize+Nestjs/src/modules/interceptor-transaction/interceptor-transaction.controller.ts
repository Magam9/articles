import { Body, Controller, Param, ParseIntPipe, Patch, Post, UseInterceptors } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { TransactionInterceptor } from './transaction.interceptor';
import { DbTransaction } from './transaction.decorator';
import { InterceptorTransactionService } from './interceptor-transaction.service';

interface CreateUserBody {
  name: string;
  email: string;
}

interface CreateDepartmentBody {
  name: string;
}

interface CreateUserDepartmentBody {
  userId: number;
  departmentId: number;
}

@Controller('interceptor-transaction')
@UseInterceptors(TransactionInterceptor)
export class InterceptorTransactionController {
  constructor(private readonly service: InterceptorTransactionService) {}

  @Post('users')
  async createUser(@Body() body: CreateUserBody, @DbTransaction() transaction: Transaction) {
    await this.service.createUser(body, transaction);
    return { status: 'committed' };
  }

  @Patch('users/:id/deactivate')
  async deactivateUser(
    @Param('id', ParseIntPipe) userId: number,
    @DbTransaction() transaction: Transaction
  ) {
    await this.service.deactivateUser(userId, transaction);
    return { status: 'committed' };
  }

  @Post('departments')
  async createDepartment(@Body() body: CreateDepartmentBody, @DbTransaction() transaction: Transaction) {
    await this.service.createDepartment(body, transaction);
    return { status: 'committed' };
  }

  @Patch('departments/:id/deactivate')
  async deactivateDepartment(
    @Param('id', ParseIntPipe) departmentId: number,
    @DbTransaction() transaction: Transaction
  ) {
    await this.service.deactivateDepartment(departmentId, transaction);
    return { status: 'committed' };
  }

  @Post('user-departments')
  async createUserDepartment(
    @Body() body: CreateUserDepartmentBody,
    @DbTransaction() transaction: Transaction
  ) {
    await this.service.createUserDepartment(body, transaction);
    return { status: 'committed' };
  }
}
