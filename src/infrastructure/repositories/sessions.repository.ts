import { db } from "@/drizzle";
import { sessions, users } from "@/drizzle/schema";
import { ISessionsRepository } from "@/src/application/repositories/sessions.repository.interface";
import { ICrashReporterService } from "@/src/application/services/crash-reporter.service.interface";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { DatabaseOperationError } from "@/src/entities/errors/common";
import { Session } from "@/src/entities/models/session";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import { User } from "@/src/entities/models/user";

export class SessionsRepository implements ISessionsRepository {
  constructor(
    private readonly instrumentationService: IInstrumentationService,
    private readonly crashReporterService: ICrashReporterService,
  ) {}

  generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
  }

  async createSession(session: Session): Promise<Session> {
    const invoker = db;
    return await this.instrumentationService.startSpan(
      { name: "SessionsRepository > createSession" },
      async () => {
        try {
          const query = invoker.insert(sessions).values(session).returning();

          const [created] = await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: "db.query",
              attributes: { "db.system": "pgsql" },
            },
            () => query.execute(),
          );

          if (created) {
            return created;
          } else {
            throw new DatabaseOperationError("Cannot create session");
          }
        } catch (err) {
          this.crashReporterService.report(err);
          throw err; // leave: convert to Entities error
        }
      },
    );
  }

  async getSession(
    sessionId: string,
  ): Promise<{ session: Session; user: User }> {
    const invoker = db;
    return await this.instrumentationService.startSpan(
      { name: "SessionsRepository > getSession" },
      async () => {
        try {
          const query = invoker
            .select({ user: users, session: sessions })
            .from(sessions)
            .innerJoin(users, eq(sessions.user_id, users.id))
            .where(eq(sessions.id, sessionId));
          const result = await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: "db.query",
              attributes: { "db.system": "pgsql" },
            },
            () => query.execute(),
          );
          return result[0];
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      },
    );
  }

  async getUserSession(
    userId: string,
  ): Promise<{ session: Session; user: User }> {
    const invoker = db;
    return await this.instrumentationService.startSpan(
      { name: "SessionsRepository > getUserSession" },
      async () => {
        try {
          const query = invoker
            .select({ user: users, session: sessions })
            .from(sessions)
            .innerJoin(users, eq(sessions.user_id, users.id))
            .where(eq(users.id, userId));
          const result = await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: "db.query",
              attributes: { "db.system": "pgsql" },
            },
            () => query.execute(),
          );
          return result[0];
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      },
    );
  }

  async updateSessionExpiresAt(
    sessionId: string,
    newExpiresAt: Date,
  ): Promise<Session> {
    const invoker = db;
    return await this.instrumentationService.startSpan(
      { name: "SessionsRepository > updateSession" },
      async () => {
        try {
          const query = invoker
            .update(sessions)
            .set({
              expires_at: newExpiresAt,
            })
            .where(eq(sessions.id, sessionId))
            .returning();
          const [result] = await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: "db.query",
              attributes: { "db.system": "pgsql" },
            },
            () => query.execute(),
          );
          return result;
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      },
    );
  }

  async deleteSession(sessionId: string): Promise<void> {
    const invoker = db;
    return await this.instrumentationService.startSpan(
      { name: "SessionsRepository > deleteSession" },
      async () => {
        try {
          const query = invoker
            .delete(sessions)
            .where(eq(sessions.id, sessionId));
          await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: "db.query",
              attributes: { "db.system": "pgsql" },
            },
            () => query.execute(),
          );
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      },
    );
  }
  async deleteUserSession(userId: string): Promise<void> {
    const invoker = db;
    return await this.instrumentationService.startSpan(
      { name: "SessionsRepository > deleteUserSession" },
      async () => {
        try {
          const query = invoker
            .delete(sessions)
            .where(eq(sessions.user_id, userId));
          await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: "db.query",
              attributes: { "db.system": "pgsql" },
            },
            () => query.execute(),
          );
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      },
    );
  }
}
