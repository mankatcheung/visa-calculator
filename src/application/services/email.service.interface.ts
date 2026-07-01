export interface IEmailService {
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
  sendVerificationEmail(to: string, verifyUrl: string): Promise<void>;
  sendEmailChangeOtp(to: string, otp: string): Promise<void>;
  sendEmailChangeAlert(to: string, pendingEmail: string): Promise<void>;
}
