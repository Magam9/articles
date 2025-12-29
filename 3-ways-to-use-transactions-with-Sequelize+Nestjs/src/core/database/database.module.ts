import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Dialect } from 'sequelize';

import { DatabaseConfig } from '../config/typings/database-config.type';
import { Envs, ServerConfig } from '../config/typings/server-config.type';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const databaseConfig =
          configService.getOrThrow<DatabaseConfig>('DatabaseConfig');
        const serverConfig =
          configService.getOrThrow<ServerConfig>('ServerConfig');

        return {
          username: databaseConfig.username,
          password: databaseConfig.password,
          database: databaseConfig.name,
          host: databaseConfig.host,
          port: databaseConfig.port,
          dialect: databaseConfig.dialect as Dialect,
          freezeTableName: true,
          logging: serverConfig.env === Envs.LOCAL,
          pool: {
            max: 180,
            min: 10
          },
          synchronize: false,
          autoLoadModels: true,
          timestamps: false,
          dialectOptions: databaseConfig.ssl
            ? {
                ssl: {
                  require: true,
                  rejectUnauthorized: false
                }
              }
            : {},
          hooks: {
            afterDefine: (model) => {
              const modelWithAttributes = model as unknown as {
                rawAttributes: Record<string, { field: string }>;
              };
              if (modelWithAttributes.rawAttributes.createdAt) {
                modelWithAttributes.rawAttributes.createdAt.field =
                  'created_at';
              }
              if (modelWithAttributes.rawAttributes.updatedAt) {
                modelWithAttributes.rawAttributes.updatedAt.field =
                  'updated_at';
              }
            }
          }
        };
      }
    })
  ]
})
export class DatabaseModule {}
