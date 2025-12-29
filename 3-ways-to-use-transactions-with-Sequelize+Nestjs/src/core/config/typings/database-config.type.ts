export type DatabaseConfig = {
  port: number;
  host: string;
  name: string;
  username: string;
  password: string;
  dialect: string;
  ssl: boolean;
};
