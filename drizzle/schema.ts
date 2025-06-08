import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const leaves = sqliteTable('leaves', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  color: text('color'),
  remarks: text('remarks'),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
});

export const userSettings = sqliteTable('user_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  visaStartDate: integer('visa_start_date', { mode: 'timestamp' }).notNull(),
  visaExpiryDate: integer('visa_expiry_date', { mode: 'timestamp' }).notNull(),
  arrivalDate: integer('arrival_date', { mode: 'timestamp' }).notNull(),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
});
