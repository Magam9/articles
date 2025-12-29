import { Module } from '@nestjs/common';
import { InterceptorTransactionController } from './interceptor-transaction.controller';
import { InterceptorTransactionService } from './interceptor-transaction.service';
import { TransactionInterceptor } from './transaction.interceptor';

@Module({
  controllers: [InterceptorTransactionController],
  providers: [InterceptorTransactionService, TransactionInterceptor]
})
export class InterceptorTransactionModule {}
