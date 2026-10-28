import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { PromiseService } from './promise.service.js';
import { parseIds } from '../../shared/parse-ids.js';
import { RequestSignal } from '../../shared/request-signal.decorator.js';

@Controller('promise')
export class PromiseController {
  constructor(private readonly service: PromiseService) {}

  @Get('ping')
  async ping() {
    return { ok: true };
  }

  @Get('dashboard/:userId')
  getDashboard(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getDashboard(userId);
  }

  @Get('users')
  getUsers(@Query('ids') ids = '') {
    return this.service.getUsers(parseIds(ids));
  }

  @Get('reports/:id')
  getReport(@Param('id') id: string) {
    return this.service.getReport(id);
  }

  @Get('reports/:id/abortable')
  async getReportAbortable(@Param('id') id: string, @RequestSignal() signal: AbortSignal) {
    try {
      return await this.service.getReportAbortable(id, signal);
    } catch (error) {
      // The client is gone, so an AbortError here is expected, not a 500 for the logs
      if (signal.aborted) return;
      throw error;
    }
  }
}
