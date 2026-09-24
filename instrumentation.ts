import * as Sentry from '@sentry/nextjs';

// Sentry owns the OpenTelemetry setup on both runtimes: traces, logs and
// metrics are all sent to Sentry (see sentry.server.config.ts / sentry.edge.config.ts).
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
