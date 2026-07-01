import { createClient } from '@libsql/client';
import { defineConfig } from 'cypress';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  // E2E Testing
  e2e: {
    baseUrl: 'http://localhost:3000', // Next.js dev server with Turbopack
    specPattern: [
      'cypress/e2e/sign-up.cy.ts', // it should be run as the first test for creating account
      'cypress/e2e/**/*.{cy,spec}.{ts,tsx}',
    ],
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on) {
      // Print cypress-axe violations to the terminal/CI log, not just the
      // Cypress GUI, since headless CI runs only show terminal output.
      on('task', {
        log(message: string) {
          console.log(message);
          return null;
        },
        table(data: unknown) {
          console.table(data);
          return null;
        },
        async verifyUser(email: string) {
          const url = process.env.DATABASE_URL ?? 'file:sqlite.db';
          const authToken = process.env.DATABASE_AUTH_TOKEN;
          const client = createClient({ url, authToken });
          try {
            await client.execute({
              sql: 'UPDATE users SET email_verified = 1 WHERE email = ?',
              args: [email],
            });
          } finally {
            client.close();
          }
          return null;
        },
      });
    },
  },

  // Component Testing
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.{cy,spec}.{ts,tsx}',
    supportFile: 'cypress/support/component.ts',
    indexHtmlFile: 'cypress/support/component-index.html',
  },
});
