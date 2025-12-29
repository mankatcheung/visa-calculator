import { URL, fileURLToPath } from 'node:url';
import env from 'vite-plugin-env-compatible';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'threads', // Use threads to ensure isolation
    maxWorkers: 1, // Run tests in a single thread
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'istanbul',
      reportsDirectory: './tests/coverage',
    },
  },
  plugins: [env()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
});
