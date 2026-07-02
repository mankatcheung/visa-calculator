import { EmailChangeToken } from '@/src/entities/models/email-change-token';
import type { ITransaction } from '@/src/entities/models/transaction.interface';

export interface IEmailChangeTokensRepository {
  createToken(
    tokenHash: string,
    userId: string,
    pendingEmail: string,
    expiresAt: Date
  ): Promise<void>;
  getToken(tokenHash: string): Promise<EmailChangeToken | undefined>;
  getActiveTokenByUserId(userId: string): Promise<EmailChangeToken | undefined>;
  deleteToken(tokenHash: string): Promise<void>;
  deleteTokensByUserId(userId: string, tx?: ITransaction): Promise<void>;
}
