import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Transaction } from 'sequelize';

export const DbTransaction = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Transaction | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.transaction as Transaction | undefined;
  }
);
