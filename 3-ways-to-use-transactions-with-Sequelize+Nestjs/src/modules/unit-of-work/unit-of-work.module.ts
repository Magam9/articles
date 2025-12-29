import { Module } from '@nestjs/common';
import { UnitOfWorkController } from './unit-of-work.controller';
import { UnitOfWorkService } from './unit-of-work.service';

@Module({
  controllers: [UnitOfWorkController],
  providers: [UnitOfWorkService]
})
export class UnitOfWorkModule {}
