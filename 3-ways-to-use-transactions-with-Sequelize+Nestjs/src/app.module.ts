import { Module } from '@nestjs/common';

import { DatabaseModule } from './core/database/database.module.js';

@Module({
  imports: [DatabaseModule],
})
export class AppModule {}
