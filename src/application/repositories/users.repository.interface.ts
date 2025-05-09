import type { User, CreateUser, UpdateUser } from '@/src/entities/models/user';
import type { ITransaction } from '@/src/entities/models/transaction.interface';

export interface IUsersRepository {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(input: CreateUser, tx?: ITransaction): Promise<User>;
  updateUser(
    id: string,
    input: Partial<UpdateUser>,
    tx?: ITransaction
  ): Promise<User>;
}
