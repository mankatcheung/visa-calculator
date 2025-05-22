import { defineConfig } from 'cypress';

export default defineConfig({
  // E2E Testing
  e2e: {
    baseUrl: 'http://localhost:3000', // Next.js dev server with Turbopack
    specPattern: [
      'cypress/e2e/sign-up.cy.ts',
      'cypress/e2e/**/*.{cy,spec}.{ts,tsx}',
    ],
    supportFile: 'cypress/support/e2e.ts',
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
