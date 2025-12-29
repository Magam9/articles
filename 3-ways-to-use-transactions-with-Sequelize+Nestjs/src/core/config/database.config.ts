import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';

import { DatabaseConfig } from './typings/database-config.type.js';

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });

export default registerAs('DatabaseConfig', (): DatabaseConfig => {
  const port = parseInt(process.env.DB_PORT ?? '0', 10);
  if (!port) {
    throw new Error('The db port is undefined');
  }

  const host = process.env.DB_HOST;
  if (!host) {
    throw new Error('The db host is undefined');
  }

  const name = process.env.DB_NAME;
  if (!name) {
    throw new Error('The db name is undefined');
  }

  const username = process.env.DB_USERNAME;
  if (!username) {
    throw new Error('The db username is undefined');
  }

  const password = process.env.DB_PASSWORD;
  if (!password) {
    throw new Error('The db password is undefined');
  }

  const dialect = process.env.DB_DIALECT;
  if (!dialect) {
    throw new Error('The db password is undefined');
  }

  const ssl = process.env.DB_SSL === 'true';
  if (!dialect) {
    throw new Error('The db ssl is undefined');
  }

  return { port, host, name, username, password, dialect, ssl };
});
