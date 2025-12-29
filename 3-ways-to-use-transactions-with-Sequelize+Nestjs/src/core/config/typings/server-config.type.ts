export const Envs = {
  LOCAL: 'local',
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
} as const;
export type EnvType = typeof Envs[keyof typeof Envs];

export type ServerConfig = {
  port: number;
  env: EnvType;
};
