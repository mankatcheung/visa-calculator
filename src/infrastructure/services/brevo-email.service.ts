import { IEmailService } from '@/src/application/services/email.service.interface';

export class BrevoEmailService implements IEmailService {
  private readonly apiKey: string;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY ?? '';
    this.senderEmail = process.env.BREVO_SENDER_EMAIL ?? '';
    this.senderName = process.env.BREVO_SENDER_NAME ?? '';
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: this.senderName, email: this.senderEmail },
        to: [{ email: to }],
        subject: 'Reset your password',
        htmlContent: `
          <p>You requested a password reset.</p>
          <p><a href="${resetUrl}">Click here to reset your password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        `,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Brevo API error ${response.status}: ${body}`);
    }
  }

  async sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: this.senderName, email: this.senderEmail },
        to: [{ email: to }],
        subject: 'Verify your email address',
        htmlContent: `
          <p>Thank you for signing up!</p>
          <p><a href="${verifyUrl}">Click here to verify your email address</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not create an account, you can safely ignore this email.</p>
        `,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Brevo API error ${response.status}: ${body}`);
    }
  }
}
