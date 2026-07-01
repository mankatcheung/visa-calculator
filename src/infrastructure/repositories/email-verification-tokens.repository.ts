import { eq } from 'drizzle-orm';

import { db } from '@/drizzle';
import { emailVerificationTokens } from '@/drizzle/schema';
import { IEmailVerificationTokensRepository } from '@/src/application/repositories/email-verification-tokens.repository.interface';
import type { ICrashReporterService } from '@/src/application/services/crash-reporter.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { EmailVerificationToken } from '@/src/entities/models/email-verification-token';

export class EmailVerificationTokensRepository
  implements IEmailVerificationTokensRepository
{
  constructor(
    private readonly instrumentationService: IInstrumentationService,
    private readonly crashReporterService: ICrashReporterService
  ) {}

  async createToken(
    tokenHash: string,
    userId: string,
    expiresAt: Date
  ): Promise<void> {
    return await this.instrumentationService.startSpan(
      { name: 'EmailVerificationTokensRepository > createToken' },
      async () => {
        try {
          const query = db
            .insert(emailVerificationTokens)
            .values({ tokenHash, userId, expiresAt });
          await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: 'db.query',
              attributes: { 'db.system': 'sqlite' },
            },
            () => query.execute()
          );
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }

  async getToken(
    tokenHash: string
  ): Promise<EmailVerificationToken | undefined> {
    return await this.instrumentationService.startSpan(
      { name: 'EmailVerificationTokensRepository > getToken' },
      async () => {
        try {
          const query = db.query.emailVerificationTokens.findFirst({
            where: eq(emailVerificationTokens.tokenHash, tokenHash),
          });
          return await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: 'db.query',
              attributes: { 'db.system': 'sqlite' },
            },
            () => query.execute()
          );
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }

  async deleteToken(tokenHash: string): Promise<void> {
    return await this.instrumentationService.startSpan(
      { name: 'EmailVerificationTokensRepository > deleteToken' },
      async () => {
        try {
          const query = db
            .delete(emailVerificationTokens)
            .where(eq(emailVerificationTokens.tokenHash, tokenHash));
          await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: 'db.query',
              attributes: { 'db.system': 'sqlite' },
            },
            () => query.execute()
          );
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }

  async deleteTokensByUserId(userId: string): Promise<void> {
    return await this.instrumentationService.startSpan(
      { name: 'EmailVerificationTokensRepository > deleteTokensByUserId' },
      async () => {
        try {
          const query = db
            .delete(emailVerificationTokens)
            .where(eq(emailVerificationTokens.userId, userId));
          await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: 'db.query',
              attributes: { 'db.system': 'sqlite' },
            },
            () => query.execute()
          );
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }
}
