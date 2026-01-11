import { Module } from '@nestjs/common';

import { UnitOfWorkController } from './unit-of-work.controller.js';
import { UnitOfWorkService } from './unit-of-work.service.js';

@Module({
  controllers: [UnitOfWorkController],
  providers: [UnitOfWorkService]
})
export class UnitOfWorkModule {}
