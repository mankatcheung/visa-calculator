import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .notNull()
    .default(true),
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

export const visas = sqliteTable('visas', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  country: text('country').notNull(),
  name: text('name').notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  expiryDate: integer('expiry_date', { mode: 'timestamp' }).notNull(),
  arrivalDate: integer('arrival_date', { mode: 'timestamp' }).notNull(),
  maxStayDays: integer('max_stay_days'),
  rollingWindowDays: integer('rolling_window_days'),
  qualifyingPeriodYears: integer('qualifying_period_years'),
  remarks: text('remarks'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  tokenHash: text('token_hash').primaryKey().notNull(),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const emailVerificationTokens = sqliteTable(
  'email_verification_tokens',
  {
    tokenHash: text('token_hash').primaryKey().notNull(),
    userId: text('user_id')
      .references(() => users.id)
      .notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  }
);

export const emailChangeTokens = sqliteTable(
  'email_change_tokens',
  {
    tokenHash: text('token_hash').primaryKey().notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    pendingEmail: text('pending_email').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  },
  (t) => [index('email_change_tokens_user_id_idx').on(t.userId)]
);
