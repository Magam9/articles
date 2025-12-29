import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { lastValueFrom, from, Observable } from 'rxjs';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(@InjectConnection() private readonly sequelize: Sequelize) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return from(
      this.sequelize.transaction(async (transaction) => {
        const request = _context.switchToHttp().getRequest();
        request.transaction = transaction;
        return lastValueFrom(next.handle());
      })
    );
  }
}
