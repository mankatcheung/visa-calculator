import { PasswordResetToken } from '@/src/entities/models/password-reset-token';
import type { ITransaction } from '@/src/entities/models/transaction.interface';

export interface IPasswordResetTokensRepository {
  createToken(
    tokenHash: string,
    userId: string,
    expiresAt: Date,
    tx?: ITransaction
  ): Promise<void>;
  getToken(tokenHash: string): Promise<PasswordResetToken | undefined>;
  deleteToken(tokenHash: string, tx?: ITransaction): Promise<void>;
  deleteTokensByUserId(userId: string, tx?: ITransaction): Promise<void>;
}
