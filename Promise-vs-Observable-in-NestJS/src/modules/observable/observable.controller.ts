import { Controller, Get, Param, ParseIntPipe, Query, Sse } from '@nestjs/common';
import { Observable, of } from 'rxjs';

import { ObservableService } from './observable.service.js';
import { parseIds } from '../../shared/parse-ids.js';

@Controller('observable')
export class ObservableController {
  constructor(private readonly service: ObservableService) {}

  @Get('ping')
  ping() {
    return of({ ok: true });
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

  @Sse('orders/:id/live')
  watchOrder(@Param('id', ParseIntPipe) id: number): Observable<MessageEvent> {
    return this.service.watchOrder(id);
  }
}
