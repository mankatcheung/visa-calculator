export type PasswordResetToken = {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
};
