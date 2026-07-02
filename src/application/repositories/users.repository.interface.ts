import type { ITransaction } from '@/src/entities/models/transaction.interface';
import type { CreateUser, UpdateUser, User } from '@/src/entities/models/user';

export interface IUsersRepository {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllEmails(): Promise<string[]>;
  createUser(input: CreateUser, tx?: ITransaction): Promise<User>;
  updateUser(
    id: string,
    input: Partial<UpdateUser>,
    tx?: ITransaction
  ): Promise<User>;
  verifyUserEmail(id: string): Promise<User>;
  applyEmailChange(userId: string, newEmail: string): Promise<User>;
  deleteUser(id: string, tx?: ITransaction): Promise<void>;
}
