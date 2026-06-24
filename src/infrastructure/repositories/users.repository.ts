import { Transaction, db } from '@/drizzle';
import { LibsqlError } from '@libsql/client';
import { hash } from 'bcrypt-ts';
import { eq } from 'drizzle-orm';

import { PASSWORD_SALT_ROUNDS } from '@/config';

import { users } from '@/drizzle/schema';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import type { ICrashReporterService } from '@/src/application/services/crash-reporter.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import {
  ConflictError,
  DatabaseOperationError,
} from '@/src/entities/errors/common';
import type { CreateUser, UpdateUser, User } from '@/src/entities/models/user';

export class UsersRepository implements IUsersRepository {
  constructor(
    private readonly instrumentationService: IInstrumentationService,
    private readonly crashReporterService: ICrashReporterService
  ) {}
  async getUser(id: string): Promise<User | undefined> {
    return await this.instrumentationService.startSpan(
      { name: 'UsersRepository > getUser' },
      async () => {
        try {
          const query = db.query.users.findFirst({
            where: eq(users.id, id),
          });

          const user = await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: 'db.query',
              attributes: { 'db.system': 'sqlite' },
            },
            () => query.execute()
          );

          return user;
        } catch (err) {
          this.crashReporterService.report(err);
          throw err; // TODO: convert to Entities error
        }
      }
    );
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    return await this.instrumentationService.startSpan(
      { name: 'UsersRepository > getUserByEmail' },
      async () => {
        try {
          const query = db.query.users.findFirst({
            where: eq(users.email, email),
          });

          const user = await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: 'db.query',
              attributes: { 'db.system': 'sqlite' },
            },
            () => query.execute()
          );

          return user;
        } catch (err) {
          this.crashReporterService.report(err);
          throw err; // TODO: convert to Entities error
        }
      }
    );
  }
  async getAllEmails(): Promise<string[]> {
    return await this.instrumentationService.startSpan(
      { name: 'UsersRepository > getAllEmails' },
      async () => {
        try {
          const query = db.select({ email: users.email }).from(users);

          const rows = await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: 'db.query',
              attributes: { 'db.system': 'sqlite' },
            },
            () => query.execute()
          );

          return rows.map((row) => row.email);
        } catch (err) {
          this.crashReporterService.report(err);
          throw err; // TODO: convert to Entities error
        }
      }
    );
  }

  async createUser(input: CreateUser): Promise<User> {
    return await this.instrumentationService.startSpan(
      { name: 'UsersRepository > createUser' },
      async () => {
        try {
          const passwordHash = await this.instrumentationService.startSpan(
            { name: 'hash password', op: 'function' },
            () => hash(input.password, PASSWORD_SALT_ROUNDS)
          );

          const newUser: User = {
            id: input.id,
            email: input.email,
            passwordHash,
          };
          const query = db.insert(users).values(newUser).returning();

          const [created] = await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: 'db.query',
              attributes: { 'db.system': 'sqlite' },
            },
            () => query.execute()
          );

          if (created) {
            return created;
          } else {
            throw new DatabaseOperationError('Cannot create user.');
          }
        } catch (err) {
          const cause = err instanceof Error ? err.cause : undefined;
          if (
            cause instanceof LibsqlError &&
            cause.code?.startsWith('SQLITE_CONSTRAINT')
          ) {
            throw new ConflictError('Email taken', { cause: err });
          }
          this.crashReporterService.report(err);
          throw err; // TODO: convert to Entities error
        }
      }
    );
  }

  async updateUser(
    id: string,
    input: Partial<UpdateUser>,
    tx?: Transaction
  ): Promise<User> {
    const invoker = tx ?? db;
    return await this.instrumentationService.startSpan(
      { name: 'UsersRepository > updateUser' },
      async () => {
        try {
          let newPasswordHash;
          if (input.password) {
            newPasswordHash = await this.instrumentationService.startSpan(
              { name: 'hash password', op: 'function' },
              () => hash(input.password!, PASSWORD_SALT_ROUNDS)
            );
          }
          const updateData: { passwordHash?: string; email?: string } = {};
          if (newPasswordHash) updateData.passwordHash = newPasswordHash;
          if (input.email) updateData.email = input.email;

          const query = invoker
            .update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning();
          const [updated] = await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: 'db.query',
              attributes: { 'db.system': 'sqlite' },
            },
            () => query.execute()
          );

          if (updated) {
            return updated;
          } else {
            throw new DatabaseOperationError('Cannot update user.');
          }
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }
}
