import { Module } from '@nestjs/common';

import { DatabaseModule } from './core/database/database.module.js';
import { DaoModule } from './dao/dao.module.js';
import { RepositoryModule } from './repositories/repository.module.js';
import { ManualTransactionModule } from './modules/manual-transaction/manual-transaction.module.js';
import { InterceptorTransactionModule } from './modules/interceptor-transaction/interceptor-transaction.module.js';
import { UnitOfWorkModule } from './modules/unit-of-work/unit-of-work.module.js';

@Module({
  imports: [
    DatabaseModule,
    DaoModule,
    RepositoryModule,
    ManualTransactionModule,
    InterceptorTransactionModule,
    UnitOfWorkModule,
  ],
})
export class AppModule {}
