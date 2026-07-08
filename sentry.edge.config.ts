// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  sendDefaultPii: false,

  // OTel provider is owned by @vercel/otel. Sentry handles errors only on Edge
  // (SentrySpanProcessor is not available for Edge runtime).
  skipOpenTelemetrySetup: true,

  debug: false,
});
