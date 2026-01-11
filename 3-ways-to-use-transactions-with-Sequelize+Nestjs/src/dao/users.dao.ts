import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { WhereOptions } from 'sequelize';

import { UserModel } from '../models/user.model.js';
import { IUser, UserCreationAttributes } from '../models/user.typings.js';
import { TransactionOptions } from './dao.typings.js';

@Injectable()
export class UsersDao {
  constructor(
    @InjectModel(UserModel)
    private userModel: typeof UserModel
  ) {}

  create(data: UserCreationAttributes, options: TransactionOptions = {}) {
    return this.userModel.create(data, options);
  }

  updateByConditions(conditions: {
    usersConditions: WhereOptions<IUser>,
  }, data: Partial<IUser>, options: TransactionOptions = {}) {
    return this.userModel.update(data, {
      ...options,
      where: conditions.usersConditions,
    });
  }
}