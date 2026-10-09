import { Module } from '@nestjs/common';

import { RepositoryModule } from '../../repositories/repository.module.js';
import { UnitOfWorkController } from './unit-of-work.controller.js';
import { UnitOfWorkService } from './unit-of-work.service.js';

@Module({
  imports: [RepositoryModule],
  controllers: [UnitOfWorkController],
  providers: [UnitOfWorkService]
})
export class UnitOfWorkModule {}
