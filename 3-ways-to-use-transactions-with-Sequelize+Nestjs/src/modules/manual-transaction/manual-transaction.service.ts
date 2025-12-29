import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';

@Injectable()
export class ManualTransactionService {
  async runWorkflow(transaction: Transaction) {
    void transaction;
    return { ok: true };
  }
}
