import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: process.env.NODE_ENV === 'test' ? 'sqlite' : 'turso',
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dbCredentials:
    process.env.NODE_ENV === 'test'
      ? {
          url: 'file:sqlite.db',
        }
      : {
          url: process.env.DATABASE_URL!,
          authToken: process.env.DATABASE_AUTH_TOKEN!,
        },
});
