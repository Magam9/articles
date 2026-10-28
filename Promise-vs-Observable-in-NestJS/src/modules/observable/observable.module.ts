import { Module } from '@nestjs/common';

import { DownstreamClient } from '../../clients/downstream.client.js';
import { ObservableController } from './observable.controller.js';
import { ObservableService } from './observable.service.js';

@Module({
  controllers: [ObservableController],
  providers: [ObservableService, DownstreamClient],
})
export class ObservableModule {}
