import { Controller, Post } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { ManualTransactionService } from './manual-transaction.service';

@Controller('manual-transaction')
export class ManualTransactionController {
  constructor(
    private readonly service: ManualTransactionService,
    @InjectConnection()
    private readonly sequelize: Sequelize
  ) {}

  @Post()
  async create() {
    const transaction = await this.sequelize.transaction();

    try {
      await this.service.runWorkflow(transaction);
      await transaction.commit();
      return { status: 'committed' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
