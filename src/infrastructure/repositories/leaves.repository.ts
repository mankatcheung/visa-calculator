import { Transaction, db } from '@/drizzle';
import { asc, count, eq } from 'drizzle-orm';

import { leaves } from '@/drizzle/schema';
import { ILeavesRepository } from '@/src/application/repositories/leaves.repository.interface';
import type { ICrashReporterService } from '@/src/application/services/crash-reporter.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { DatabaseOperationError } from '@/src/entities/errors/common';
import { Leave, LeaveInsert, LeaveUpdate, PaginatedLeaves } from '@/src/entities/models/leave';

export class LeavesRepository implements ILeavesRepository {
  constructor(
    private readonly instrumentationService: IInstrumentationService,
    private readonly crashReporterService: ICrashReporterService
  ) {}

  async createLeave(leave: LeaveInsert, tx?: Transaction): Promise<Leave> {
    const invoker = tx ?? db;

    return await this.instrumentationService.startSpan(
      { name: 'LeavesRepository > createLeave' },
      async () => {
        try {
          const query = invoker.insert(leaves).values(leave).returning();

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
            throw new DatabaseOperationError('Cannot create leave');
          }
        } catch (err) {
          this.crashReporterService.report(err);
          throw err; // leave: convert to Entities error
        }
      }
    );
  }

  async getLeave(id: number): Promise<Leave | undefined> {
    return await this.instrumentationService.startSpan(
      { name: 'LeavesRepository > getLeave' },
      async () => {
        try {
          const query = db.query.leaves.findFirst({
            where: eq(leaves.id, id),
          });

          const leave = await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: 'db.query',
              attributes: { 'db.system': 'sqlite' },
            },
            () => query.execute()
          );

          return leave;
        } catch (err) {
          this.crashReporterService.report(err);
          throw err; // leave: convert to Entities error
        }
      }
    );
  }

  async getLeavesForUser(userId: string): Promise<Leave[]> {
    return await this.instrumentationService.startSpan(
      { name: 'LeavesRepository > getLeavesForUser' },
      async () => {
        try {
          const query = db.query.leaves.findMany({
            orderBy: [asc(leaves.startDate)],
            where: eq(leaves.userId, userId),
          });

          const usersLeaves = await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: 'db.query',
              attributes: { 'db.system': 'sqlite' },
            },
            () => query.execute()
          );
          return usersLeaves;
        } catch (err) {
          this.crashReporterService.report(err);
          throw err; // leave: convert to Entities error
        }
      }
    );
  }

  async getPaginatedLeavesForUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedLeaves> {
    return await this.instrumentationService.startSpan(
      { name: 'LeavesRepository > getPaginatedLeavesForUser' },
      async () => {
        try {
          const offset = (page - 1) * limit;
          const where = eq(leaves.userId, userId);

          const [data, totalResult] = await Promise.all([
            db.query.leaves.findMany({
              orderBy: [asc(leaves.startDate)],
              where,
              limit,
              offset,
            }),
            db.select({ value: count() }).from(leaves).where(where),
          ]);

          const total = totalResult[0]?.value ?? 0;
          return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }

  async updateLeave(
    id: number,
    input: Partial<LeaveUpdate>,
    tx?: Transaction
  ): Promise<Leave> {
    const invoker = tx ?? db;
    return await this.instrumentationService.startSpan(
      { name: 'LeavesRepository > updateLeave' },
      async () => {
        try {
          const query = invoker
            .update(leaves)
            .set(input)
            .where(eq(leaves.id, id))
            .returning();

          const [updated] = await this.instrumentationService.startSpan(
            {
              name: query.toSQL().sql,
              op: 'db.query',
              attributes: { 'db.system': 'sqlite' },
            },
            () => query.execute()
          );
          return updated;
        } catch (err) {
          this.crashReporterService.report(err);
          throw err; // leave: convert to Entities error
        }
      }
    );
  }

  async deleteLeave(id: number, _userId: string, tx?: Transaction): Promise<void> {
    const invoker = tx ?? db;

    await this.instrumentationService.startSpan(
      { name: 'LeavesRepository > deleteLeave' },
      async () => {
        try {
          const query = invoker
            .delete(leaves)
            .where(eq(leaves.id, id))
            .returning();

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
          throw err; // leave: convert to Entities error
        }
      }
    );
  }

  async deleteLeavesForUser(userId: string, tx?: Transaction): Promise<void> {
    const invoker = tx ?? db;

    await this.instrumentationService.startSpan(
      { name: 'LeavesRepository > deleteLeavesForUser' },
      async () => {
        try {
          const query = invoker.delete(leaves).where(eq(leaves.userId, userId));

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
          throw err; // leave: convert to Entities error
        }
      }
    );
  }
}
