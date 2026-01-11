import { Injectable } from '@nestjs/common';

import { TransactionOptions } from '../dao/dao.typings.js';
import { UsersDao } from '../dao/users.dao.js';
import { UserCreationAttributes } from '../models/user.typings.js';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly usersDao: UsersDao,
  ) {}

  async create(data: UserCreationAttributes, options: TransactionOptions = {}) {
    const result = await this.usersDao.create(data, options);
    return result.toJSON();
  }
}
