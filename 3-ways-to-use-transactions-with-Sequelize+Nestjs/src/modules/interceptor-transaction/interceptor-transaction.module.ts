import { Module } from '@nestjs/common';

import { RepositoryModule } from '../../repositories/repository.module.js';
import { InterceptorTransactionController } from './interceptor-transaction.controller.js';
import { InterceptorTransactionService } from './interceptor-transaction.service.js';
import { TransactionInterceptor } from './transaction.interceptor.js';

@Module({
  imports: [RepositoryModule],
  controllers: [InterceptorTransactionController],
  providers: [InterceptorTransactionService, TransactionInterceptor]
})
export class InterceptorTransactionModule {}
