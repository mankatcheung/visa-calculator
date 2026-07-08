import * as Sentry from '@sentry/nextjs';
import { registerOTel } from '@vercel/otel';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

export async function register() {
  // ── OTel traces → Axiom ────────────────────────────────────────────────
  // registerOTel must run before Sentry so our tracer provider wins the
  // global slot. Sentry is initialised with skipOpenTelemetrySetup: true to
  // prevent it from replacing our provider.
  const token = process.env.AXIOM_TOKEN;
  const dataset = process.env.AXIOM_DATASET;

  if (token && dataset) {
    registerOTel({
      serviceName: process.env.OTEL_SERVICE_NAME ?? 'visa-calculator',
      traceExporter: new OTLPTraceExporter({
        url: `${process.env.AXIOM_URL ?? 'https://api.axiom.co'}/v1/traces`,
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Axiom-Dataset': dataset,
        },
      }),
    });
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
    // OTel metrics + logs providers (Node.js runtime only — not supported on Edge)
    const { initOtelProviders } = await import('./src/infrastructure/telemetry/otel');
    initOtelProviders();
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
