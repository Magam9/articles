import { Controller, Get, Module } from '@nestjs/common';

import { ObservableModule } from './modules/observable/observable.module.js';
import { PromiseModule } from './modules/promise/promise.module.js';

/** Baseline for the benchmark: a plain synchronous handler. */
@Controller('sync')
class SyncController {
  @Get('ping')
  ping() {
    return { ok: true };
  }
}

@Module({
  imports: [PromiseModule, ObservableModule],
  controllers: [SyncController],
})
export class AppModule {}
