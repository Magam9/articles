import { Controller, Post } from '@nestjs/common';
import { UnitOfWorkService } from './unit-of-work.service';

@Controller('unit-of-work')
export class UnitOfWorkController {
  constructor(private readonly service: UnitOfWorkService) {}

  @Post()
  async create() {
    await this.service.runUseCase();
    return { status: 'committed' };
  }
}
