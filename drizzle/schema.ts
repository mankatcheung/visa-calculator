import {
  date,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull(),
  password_hash: text("password_hash").notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().notNull(),
  user_id: text("user_id")
    .references(() => users.id)
    .notNull(),
  expires_at: timestamp("expires_at").notNull(),
});

export const leaves = pgTable("leaves", {
  id: serial("id").primaryKey().notNull(),
  created_at: timestamp("created_at").notNull(),
  start_date: date("start_date").notNull(),
  end_date: date("end_date").notNull(),
  color: varchar("color"),
  remarks: text("remarks"),
  user: uuid("user")
    .references(() => users.id)
    .notNull(),
});

export type InsertLeave = typeof leaves.$inferInsert;
