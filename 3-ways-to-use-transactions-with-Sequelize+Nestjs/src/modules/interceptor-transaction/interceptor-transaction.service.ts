import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';

@Injectable()
export class InterceptorTransactionService {
  async runWorkflow(transaction: Transaction) {
    void transaction;
    return { ok: true };
  }
}
