// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // COMPLIANCE/PRIVACY: explicit opt-out of Sentry's "send default PII"
  // behavior (IP addresses, request headers/cookies, etc.). Keep this
  // false unless there's a documented reason to collect it -- see the
  // Privacy Policy's data-inventory section.
  sendDefaultPii: false,

  // Tracing and metrics are handled by OTel → Axiom.
  // Sentry is retained for error/exception capture only.
  tracesSampleRate: 0,

  // Prevent Sentry from registering its own OTel providers, which would
  // conflict with the @vercel/otel provider registered in instrumentation.ts.
  skipOpenTelemetrySetup: true,

  debug: false,
});
