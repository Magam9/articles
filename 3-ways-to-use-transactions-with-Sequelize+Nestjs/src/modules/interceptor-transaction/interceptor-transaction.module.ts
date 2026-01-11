import { Module } from '@nestjs/common';

import { InterceptorTransactionController } from './interceptor-transaction.controller.js';
import { InterceptorTransactionService } from './interceptor-transaction.service.js';
import { TransactionInterceptor } from './transaction.interceptor.js';

@Module({
  controllers: [InterceptorTransactionController],
  providers: [InterceptorTransactionService, TransactionInterceptor]
})
export class InterceptorTransactionModule {}
