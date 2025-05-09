import { hashSync } from 'bcrypt-ts';

import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import type { CreateUser, UpdateUser, User } from '@/src/entities/models/user';
import { PASSWORD_SALT_ROUNDS } from '@/config';

export class MockUsersRepository implements IUsersRepository {
  private _users: User[];

  constructor() {
    this._users = [
      {
        id: '1',
        email: 'one@test.com',
        passwordHash: hashSync('password-one', PASSWORD_SALT_ROUNDS),
      },
      {
        id: '2',
        email: 'two@test.com',
        passwordHash: hashSync('password-two', PASSWORD_SALT_ROUNDS),
      },
      {
        id: '3',
        email: 'three@test.com',
        passwordHash: hashSync('password-three', PASSWORD_SALT_ROUNDS),
      },
    ];
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = this._users.find((u) => u.id === id);
    return user;
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = this._users.find((u) => u.email === email);
    return user;
  }
  async createUser(input: CreateUser): Promise<User> {
    const newUser: User = {
      id: (this._users.length + 1).toString(),
      email: input.email,
      passwordHash: hashSync(input.password, PASSWORD_SALT_ROUNDS),
    };
    this._users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, input: Partial<UpdateUser>): Promise<User> {
    const existingIndex = this._users.findIndex((t) => t.id === id);
    const updateValue: Partial<User> = {};
    if (input.email) {
      updateValue.email = input.email;
    }
    if (input.password) {
      updateValue.passwordHash = hashSync(input.password, PASSWORD_SALT_ROUNDS);
    }
    const updated = {
      ...this._users[existingIndex],
      ...updateValue,
    };
    this._users[existingIndex] = updated;
    return updated;
  }
}
