import { PasswordResetToken } from '@/src/entities/models/password-reset-token';

export interface IPasswordResetTokensRepository {
  createToken(tokenHash: string, userId: string, expiresAt: Date): Promise<void>;
  getToken(tokenHash: string): Promise<PasswordResetToken | undefined>;
  deleteToken(tokenHash: string): Promise<void>;
  deleteTokensByUserId(userId: string): Promise<void>;
}
