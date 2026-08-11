import { Transaction, db } from '@/drizzle';
import { and, asc, eq } from 'drizzle-orm';

import { visas } from '@/drizzle/schema';
import { IVisasRepository } from '@/src/application/repositories/visas.repository.interface';
import type { ICrashReporterService } from '@/src/application/services/crash-reporter.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { DatabaseOperationError } from '@/src/entities/errors/common';
import type { CreateVisa, UpdateVisa, Visa } from '@/src/entities/models/visa';

export class VisasRepository implements IVisasRepository {
  constructor(
    private readonly instrumentationService: IInstrumentationService,
    private readonly crashReporterService: ICrashReporterService
  ) {}

  async createVisa(data: CreateVisa, userId: string, tx?: Transaction): Promise<Visa> {
    const invoker = tx ?? db;
    return await this.instrumentationService.startSpan(
      { name: 'VisasRepository > createVisa' },
      async () => {
        try {
          const query = invoker.insert(visas).values({ ...data, userId }).returning();
          const [created] = await this.instrumentationService.startSpan(
            { name: query.toSQL().sql, op: 'db.query', attributes: { 'db.system': 'sqlite' } },
            () => query.execute()
          );
          if (created) return created;
          throw new DatabaseOperationError('Cannot create visa');
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }

  async getVisa(id: number, userId: string): Promise<Visa | undefined> {
    return await this.instrumentationService.startSpan(
      { name: 'VisasRepository > getVisa' },
      async () => {
        try {
          const query = db.query.visas.findFirst({
            where: and(eq(visas.id, id), eq(visas.userId, userId)),
          });
          return await this.instrumentationService.startSpan(
            { name: query.toSQL().sql, op: 'db.query', attributes: { 'db.system': 'sqlite' } },
            () => query.execute()
          );
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }

  async getVisasForUser(userId: string): Promise<Visa[]> {
    return await this.instrumentationService.startSpan(
      { name: 'VisasRepository > getVisasForUser' },
      async () => {
        try {
          const query = db.query.visas.findMany({
            orderBy: [asc(visas.createdAt)],
            where: eq(visas.userId, userId),
          });
          return await this.instrumentationService.startSpan(
            { name: query.toSQL().sql, op: 'db.query', attributes: { 'db.system': 'sqlite' } },
            () => query.execute()
          );
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }

  async updateVisa(
    id: number,
    userId: string,
    data: Partial<UpdateVisa>,
    tx?: Transaction
  ): Promise<Visa> {
    const invoker = tx ?? db;
    return await this.instrumentationService.startSpan(
      { name: 'VisasRepository > updateVisa' },
      async () => {
        try {
          const query = invoker
            .update(visas)
            .set(data)
            .where(and(eq(visas.id, id), eq(visas.userId, userId)))
            .returning();
          const [updated] = await this.instrumentationService.startSpan(
            { name: query.toSQL().sql, op: 'db.query', attributes: { 'db.system': 'sqlite' } },
            () => query.execute()
          );
          if (updated) return updated;
          throw new DatabaseOperationError('Cannot update visa');
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }

  async deleteVisa(id: number, userId: string, tx?: Transaction): Promise<void> {
    const invoker = tx ?? db;
    await this.instrumentationService.startSpan(
      { name: 'VisasRepository > deleteVisa' },
      async () => {
        try {
          const query = invoker
            .delete(visas)
            .where(and(eq(visas.id, id), eq(visas.userId, userId)));
          await this.instrumentationService.startSpan(
            { name: query.toSQL().sql, op: 'db.query', attributes: { 'db.system': 'sqlite' } },
            () => query.execute()
          );
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }

  async deleteVisasForUser(userId: string, tx?: Transaction): Promise<void> {
    const invoker = tx ?? db;
    await this.instrumentationService.startSpan(
      { name: 'VisasRepository > deleteVisasForUser' },
      async () => {
        try {
          const query = invoker.delete(visas).where(eq(visas.userId, userId));
          await this.instrumentationService.startSpan(
            { name: query.toSQL().sql, op: 'db.query', attributes: { 'db.system': 'sqlite' } },
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
