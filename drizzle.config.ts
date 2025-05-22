import { defineConfig } from 'drizzle-kit';

const connectionString = process.env.DATABASE_URL;
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
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  };
}

export default defineConfig({
  dialect: isTesting ? 'sqlite' : 'turso',
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dbCredentials,
});
