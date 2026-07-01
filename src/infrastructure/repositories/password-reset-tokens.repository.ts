import { eq } from 'drizzle-orm';

import { db } from '@/drizzle';
import { passwordResetTokens } from '@/drizzle/schema';
import { IPasswordResetTokensRepository } from '@/src/application/repositories/password-reset-tokens.repository.interface';
import type { ICrashReporterService } from '@/src/application/services/crash-reporter.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { PasswordResetToken } from '@/src/entities/models/password-reset-token';

export class PasswordResetTokensRepository
  implements IPasswordResetTokensRepository
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
      { name: 'PasswordResetTokensRepository > createToken' },
      async () => {
        try {
          const query = db
            .insert(passwordResetTokens)
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

  async getToken(tokenHash: string): Promise<PasswordResetToken | undefined> {
    return await this.instrumentationService.startSpan(
      { name: 'PasswordResetTokensRepository > getToken' },
      async () => {
        try {
          const query = db.query.passwordResetTokens.findFirst({
            where: eq(passwordResetTokens.tokenHash, tokenHash),
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
      { name: 'PasswordResetTokensRepository > deleteToken' },
      async () => {
        try {
          const query = db
            .delete(passwordResetTokens)
            .where(eq(passwordResetTokens.tokenHash, tokenHash));
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
      { name: 'PasswordResetTokensRepository > deleteTokensByUserId' },
      async () => {
        try {
          const query = db
            .delete(passwordResetTokens)
            .where(eq(passwordResetTokens.userId, userId));
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
