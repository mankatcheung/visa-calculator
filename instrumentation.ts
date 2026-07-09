import * as Sentry from '@sentry/nextjs';
import { registerOTel } from '@vercel/otel';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import type { SpanProcessor } from '@opentelemetry/sdk-trace-base';

export async function register() {
  const token = process.env.AXIOM_TOKEN;
  const dataset = process.env.AXIOM_DATASET;
  const axiomUrl = process.env.AXIOM_URL ?? 'https://api.axiom.co';
  const axiomHeaders = token && dataset
    ? { Authorization: `Bearer ${token}`, 'X-Axiom-Dataset': dataset }
    : undefined;

  // ── Span processors ───────────────────────────────────────────────────────
  // Axiom: receives all spans for deep trace analytics.
  // Sentry: SentrySpanProcessor forwards spans for error-linked tracing
  //         (Node.js only — @sentry/opentelemetry does not support Edge).
  const spanProcessors: SpanProcessor[] = [];

  if (axiomHeaders) {
    spanProcessors.push(
      new BatchSpanProcessor(
        new OTLPTraceExporter({ url: `${axiomUrl}/v1/traces`, headers: axiomHeaders })
      )
    );
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialise Sentry before SentrySpanProcessor so the client is ready.
    await import('./sentry.server.config');
    const { SentrySpanProcessor } = await import('@sentry/opentelemetry');
    spanProcessors.push(new SentrySpanProcessor());
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }

  // ── Register all three OTel signals in one call ───────────────────────────
  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME ?? 'visa-calculator',
    spanProcessors,
    ...(axiomHeaders && {
      logRecordProcessors: [
        new BatchLogRecordProcessor({
          exporter: new OTLPLogExporter({ url: `${axiomUrl}/v1/logs`, headers: axiomHeaders }),
        }),
      ],
      metricReaders: [
        new PeriodicExportingMetricReader({
          exporter: new OTLPMetricExporter({ url: `${axiomUrl}/v1/metrics`, headers: axiomHeaders }),
          exportIntervalMillis: 30_000,
        }),
      ],
    }),
  });
}

export const onRequestError = Sentry.captureRequestError;
