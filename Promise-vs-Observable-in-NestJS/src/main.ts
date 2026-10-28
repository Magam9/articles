import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { TimingInterceptor } from './shared/timing.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });

  // Benchmarks run with and without an interceptor, because most real apps have at least one
  if (process.env.WITH_INTERCEPTOR === 'true') {
    app.useGlobalInterceptors(new TimingInterceptor());
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
}

bootstrap();
