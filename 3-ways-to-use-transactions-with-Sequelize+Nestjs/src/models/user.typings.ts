import { Nullable } from '../shared/typings.js';

export interface IUser {
  id: number;
  name: string;
  email: string;
  deactivatedAt: Nullable<Date>;
  createdAt: Date;
  updatedAt: Date;
}

export type UserCreationAttributes = Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>;
