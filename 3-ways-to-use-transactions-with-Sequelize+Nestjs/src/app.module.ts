import { Module } from '@nestjs/common';

import { DatabaseModule } from './core/database/database.module.js';
import { DaoModule } from './dao/dao.module.js';
import { RepositoryModule } from './repositories/repository.module.js';

@Module({
  imports: [DatabaseModule, DaoModule, RepositoryModule],
})
export class AppModule {}
