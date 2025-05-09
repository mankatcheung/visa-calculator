import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import env from 'vite-plugin-env-compatible';
import { codecovVitePlugin } from '@codecov/vite-plugin';

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reportsDirectory: './tests/coverage',
    },
  },
  plugins: [
    env(),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: 'visa-calculator',
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
});
