import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull(),
  password_hash: text("password_hash").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().notNull(),
  user_id: text("user_id")
    .references(() => users.id)
    .notNull(),
  expires_at: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const leaves = sqliteTable("leaves", {
  id: text("id").primaryKey().notNull(),
  created_at: integer("created_at", { mode: "timestamp" }).notNull(),
  start_date: integer("start_date", { mode: "timestamp" }).notNull(),
  end_date: integer("end_date", { mode: "timestamp" }).notNull(),
  color: text("color"),
  remarks: text("remarks"),
  user_id: text("user_id")
    .references(() => users.id)
    .notNull(),
});

export type InsertLeave = typeof leaves.$inferInsert;
