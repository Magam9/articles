import { Controller, Post, UseInterceptors } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { TransactionInterceptor } from './transaction.interceptor';
import { DbTransaction } from './transaction.decorator';
import { InterceptorTransactionService } from './interceptor-transaction.service';

@Controller('interceptor-transaction')
@UseInterceptors(TransactionInterceptor)
export class InterceptorTransactionController {
  constructor(private readonly service: InterceptorTransactionService) {}

  @Post()
  async create(@DbTransaction() transaction: Transaction) {
    await this.service.runWorkflow(transaction);
    return { status: 'committed' };
  }
}
