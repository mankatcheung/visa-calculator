import { EmailVerificationToken } from '@/src/entities/models/email-verification-token';
import type { ITransaction } from '@/src/entities/models/transaction.interface';

export interface IEmailVerificationTokensRepository {
  createToken(
    tokenHash: string,
    userId: string,
    expiresAt: Date,
    tx?: ITransaction
  ): Promise<void>;
  getToken(tokenHash: string): Promise<EmailVerificationToken | undefined>;
  deleteToken(tokenHash: string, tx?: ITransaction): Promise<void>;
  deleteTokensByUserId(userId: string, tx?: ITransaction): Promise<void>;
}
