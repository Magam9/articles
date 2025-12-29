import { Module } from '@nestjs/common';
import { ManualTransactionController } from './manual-transaction.controller';
import { ManualTransactionService } from './manual-transaction.service';

@Module({
  controllers: [ManualTransactionController],
  providers: [ManualTransactionService]
})
export class ManualTransactionModule {}
