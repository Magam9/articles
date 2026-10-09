import { Module } from '@nestjs/common';

import { RepositoryModule } from '../../repositories/repository.module.js';
import { ManualTransactionController } from './manual-transaction.controller.js';
import { ManualTransactionService } from './manual-transaction.service.js';

@Module({
  imports: [RepositoryModule],
  controllers: [ManualTransactionController],
  providers: [ManualTransactionService]
})
export class ManualTransactionModule {}
