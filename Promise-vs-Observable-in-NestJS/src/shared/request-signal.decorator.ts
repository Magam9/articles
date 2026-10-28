import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Gives a handler an AbortSignal that fires when the client disconnects.
 * This is the piece of plumbing Promises need to get cancellation.
 */
export const RequestSignal = createParamDecorator((_: unknown, ctx: ExecutionContext): AbortSignal => {
  const http = ctx.switchToHttp();
  const req = http.getRequest<Request>();
  const res = http.getResponse<Response>();
  const controller = new AbortController();

  res.on('close', () => {
    if (!res.writableFinished) controller.abort();
  });
  req.socket.once('close', () => controller.abort());

  return controller.signal;
});
