import { ExtractTablesWithRelations } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { sessions, users, leaves } from './schema';

import { SQLiteTransaction } from 'drizzle-orm/sqlite-core';
import { createClient, ResultSet } from '@libsql/client';

const connectionString = process.env.DATABASE_URL;
const databaseToken = process.env.DATABASE_AUTH_TOKEN;

export const client = createClient(
  process.env.NODE_ENV === 'test'
    ? {
        url: 'file:sqlite.db',
      }
    : {
        url: connectionString ?? 'file:sqlite.db',
        authToken: databaseToken,
      }
);

export const db = drizzle(client, { schema: { users, sessions, leaves } });

type Schema = {
  users: typeof users;
  sessions: typeof sessions;
  leaves: typeof leaves;
};

export type Transaction = SQLiteTransaction<
  'async',
  ResultSet,
  Schema,
  ExtractTablesWithRelations<Schema>
>;
