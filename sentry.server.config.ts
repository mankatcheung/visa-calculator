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

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
