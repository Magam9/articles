import { Module } from '@nestjs/common';

import { ManualTransactionController } from './manual-transaction.controller.js';
import { ManualTransactionService } from './manual-transaction.service.js';

@Module({
  controllers: [ManualTransactionController],
  providers: [ManualTransactionService]
})
export class ManualTransactionModule {}
