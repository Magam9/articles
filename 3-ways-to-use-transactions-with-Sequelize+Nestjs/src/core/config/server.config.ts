import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';

import * as path from 'path';
import { fileURLToPath } from 'url';

import { EnvType, ServerConfig } from './typings/server-config.type.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });

export default registerAs('ServerConfig', (): ServerConfig => {
  const port = parseInt(process.env.HTTP_PORT ?? '0', 10);
  if (!port) {
    throw new Error('The server port is undefined');
  }

  const env = process.env.NODE_ENV as EnvType | undefined;
  if (!env) {
    throw new Error('The server env is undefined');
  }

  return {
    env,
    port,
  };
});
