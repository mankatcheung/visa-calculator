import react from '@vitejs/plugin-react';
import { URL, fileURLToPath } from 'node:url';
import env from 'vite-plugin-env-compatible';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'threads', // Use threads to ensure isolation
    maxWorkers: 1, // Run tests in a single worker
    clearMocks: true, // Reset vi.fn() call history between tests in the same file
    setupFiles: ['./tests/setup.ts', './tests/setup-rtl.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', 'visa-calculator/**'],
    coverage: {
      provider: 'istanbul',
      reportsDirectory: './tests/coverage',
    },
  },
  plugins: [env(), react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
});
