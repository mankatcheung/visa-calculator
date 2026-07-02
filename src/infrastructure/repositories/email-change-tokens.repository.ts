import { Transaction, db } from '@/drizzle';
import { and, eq, gt } from 'drizzle-orm';

import { emailChangeTokens } from '@/drizzle/schema';
import { IEmailChangeTokensRepository } from '@/src/application/repositories/email-change-tokens.repository.interface';
import type { ICrashReporterService } from '@/src/application/services/crash-reporter.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { EmailChangeToken } from '@/src/entities/models/email-change-token';

export class EmailChangeTokensRepository implements IEmailChangeTokensRepository {
  constructor(
    private readonly instrumentationService: IInstrumentationService,
    private readonly crashReporterService: ICrashReporterService
  ) {}

  async createToken(
    tokenHash: string,
    userId: string,
    pendingEmail: string,
    expiresAt: Date
  ): Promise<void> {
    return await this.instrumentationService.startSpan(
      { name: 'EmailChangeTokensRepository > createToken' },
      async () => {
        try {
          const query = db
            .insert(emailChangeTokens)
            .values({ tokenHash, userId, pendingEmail, expiresAt });
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

  async getToken(tokenHash: string): Promise<EmailChangeToken | undefined> {
    return await this.instrumentationService.startSpan(
      { name: 'EmailChangeTokensRepository > getToken' },
      async () => {
        try {
          const query = db.query.emailChangeTokens.findFirst({
            where: eq(emailChangeTokens.tokenHash, tokenHash),
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

  async getActiveTokenByUserId(
    userId: string
  ): Promise<EmailChangeToken | undefined> {
    return await this.instrumentationService.startSpan(
      { name: 'EmailChangeTokensRepository > getActiveTokenByUserId' },
      async () => {
        try {
          const now = new Date();
          const query = db.query.emailChangeTokens.findFirst({
            where: and(
              eq(emailChangeTokens.userId, userId),
              gt(emailChangeTokens.expiresAt, now)
            ),
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
      { name: 'EmailChangeTokensRepository > deleteToken' },
      async () => {
        try {
          const query = db
            .delete(emailChangeTokens)
            .where(eq(emailChangeTokens.tokenHash, tokenHash));
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

  async deleteTokensByUserId(userId: string, tx?: Transaction): Promise<void> {
    const invoker = tx ?? db;
    return await this.instrumentationService.startSpan(
      { name: 'EmailChangeTokensRepository > deleteTokensByUserId' },
      async () => {
        try {
          const query = invoker
            .delete(emailChangeTokens)
            .where(eq(emailChangeTokens.userId, userId));
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
