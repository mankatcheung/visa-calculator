export type EmailChangeToken = {
  tokenHash: string;
  userId: string;
  pendingEmail: string;
  expiresAt: Date;
};
