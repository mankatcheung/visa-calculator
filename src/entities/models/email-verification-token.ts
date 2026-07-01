export type EmailVerificationToken = {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
};
