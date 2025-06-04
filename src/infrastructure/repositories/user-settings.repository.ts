import { Transaction, db } from '@/drizzle';
import { eq } from 'drizzle-orm';

import { userSettings } from '@/drizzle/schema';
import { IUserSettingsRepository } from '@/src/application/repositories/user-settings.repository.interface';
import type { ICrashReporterService } from '@/src/application/services/crash-reporter.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import {
  UserSetting,
  UserSettingUpdate,
} from '@/src/entities/models/userSettings';

export class UserSettingsRepository implements IUserSettingsRepository {
  constructor(
    private readonly instrumentationService: IInstrumentationService,
    private readonly crashReporterService: ICrashReporterService
  ) {}

  async getUserSettingsForUser(
    userId: string
  ): Promise<UserSetting | undefined> {
    return await this.instrumentationService.startSpan(
      { name: 'UserSettingsRepository > getUserSettingsForUser' },
      async () => {
        try {
          const query = db.query.userSettings.findFirst({
            where: eq(userSettings.userId, userId),
          });

          const userSetting = await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: 'db.query',
              attributes: { 'db.system': 'pgsql' },
            },
            () => query.execute()
          );
          return userSetting;
        } catch (err) {
          this.crashReporterService.report(err);
          throw err; // leave: convert to Entities error
        }
      }
    );
  }

  async createUserSettings(userId: string, tx?: any): Promise<UserSetting> {
    const invoker = tx ?? db;
    return await this.instrumentationService.startSpan(
      { name: 'UserSettingsRepository > createUserSettings' },
      async () => {
        try {
          const query = invoker
            .insert(userSettings)
            .values({
              userId,
              visaStartDate: new Date(),
            })
            .returning();

          const [created] = await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: 'db.query',
              attributes: { 'db.system': 'pgsql' },
            },
            () => query.execute()
          );
          return created;
        } catch (err) {
          console.log(err);
          this.crashReporterService.report(err);
          throw err; // leave: convert to Entities error
        }
      }
    );
  }

  async updateUserSettings(
    userId: string,
    input: Partial<UserSettingUpdate>,
    tx?: Transaction
  ): Promise<UserSetting> {
    const invoker = tx ?? db;
    return await this.instrumentationService.startSpan(
      { name: 'UserSettingsRepository > updateUserSettings' },
      async () => {
        try {
          const query = invoker
            .update(userSettings)
            .set(input)
            .where(eq(userSettings.userId, userId))
            .returning();

          const [updated] = await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: 'db.query',
              attributes: { 'db.system': 'pgsql' },
            },
            () => query.execute()
          );
          return updated;
        } catch (err) {
          console.log(err);
          this.crashReporterService.report(err);
          throw err; // leave: convert to Entities error
        }
      }
    );
  }
}
