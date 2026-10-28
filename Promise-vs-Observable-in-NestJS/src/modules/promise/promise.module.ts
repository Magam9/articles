import { Module } from '@nestjs/common';

import { DownstreamClient } from '../../clients/downstream.client.js';
import { PromiseController } from './promise.controller.js';
import { PromiseService } from './promise.service.js';

@Module({
  controllers: [PromiseController],
  providers: [PromiseService, DownstreamClient],
})
export class PromiseModule {}
