import { client, db } from '@/drizzle';
import { seed } from './seed';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { afterAll, beforeAll } from 'vitest';
import { existsSync, unlinkSync } from 'fs';

beforeAll(async () => {
  await migrate(db, { migrationsFolder: './drizzle/migrations' });
  await seed();
});

afterAll(async () => {
  const dbPath = './sqlite.db';
  // Close the client and delete the database file
  client.close();
  try {
    if (existsSync(dbPath)) {
      unlinkSync(dbPath);
    }
  } catch (error) {
    console.warn('Failed to delete test database file:', error);
  }
});
