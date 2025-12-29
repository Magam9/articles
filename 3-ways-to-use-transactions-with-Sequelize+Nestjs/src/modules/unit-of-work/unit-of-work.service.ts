import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';

@Injectable()
export class UnitOfWorkService {
  constructor(@InjectConnection() private readonly sequelize: Sequelize) {}

  async runUseCase() {
    return this.sequelize.transaction(async (transaction) => {
      void transaction;
      return { ok: true };
    });
  }
}
