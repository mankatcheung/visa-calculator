import { ResultSet, createClient } from '@libsql/client';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { SQLiteTransaction } from 'drizzle-orm/sqlite-core';

import { leaves, sessions, users } from './schema';

const connectionString = process.env.DATABASE_URL;
const databaseToken = process.env.DATABASE_AUTH_TOKEN;
const e2eDatabaseUrl = process.env.E2E_DATABASE_URL;
const isTesting = process.env.NODE_ENV === 'test';
const fileBasedDatabasePath = 'file:sqlite.db';

let dbCredentials;
if (isTesting) {
  dbCredentials = { url: fileBasedDatabasePath };
} else if (e2eDatabaseUrl) {
  dbCredentials = { url: e2eDatabaseUrl };
} else {
  dbCredentials = {
    url: connectionString ?? fileBasedDatabasePath,
    authToken: databaseToken,
  };
}
export const client = createClient(dbCredentials);

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
