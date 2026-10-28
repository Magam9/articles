import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import { Observable, tap } from 'rxjs';

/**
 * Even if every controller in your app returns a Promise,
 * interceptors still speak RxJS: next.handle() is always an Observable.
 */
@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = performance.now();
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const ms = (performance.now() - startedAt).toFixed(1);
        if (!res.headersSent) res.setHeader('server-timing', `handler;dur=${ms}`);
      })
    );
  }
}
