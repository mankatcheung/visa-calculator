import { defineConfig } from 'cypress';

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
