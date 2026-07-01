import { EmailVerificationToken } from '@/src/entities/models/email-verification-token';

export interface IEmailVerificationTokensRepository {
  createToken(tokenHash: string, userId: string, expiresAt: Date): Promise<void>;
  getToken(tokenHash: string): Promise<EmailVerificationToken | undefined>;
  deleteToken(tokenHash: string): Promise<void>;
  deleteTokensByUserId(userId: string): Promise<void>;
}
