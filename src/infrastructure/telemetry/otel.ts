import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { logs } from '@opentelemetry/api-logs';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { metrics } from '@opentelemetry/api';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

// Initialises the OTel MeterProvider and LoggerProvider and registers them as
// globals so that getMeter() / getLogger() calls in application code resolve
// to these providers without any direct SDK dependency in those files.
// Must be called once at server startup (Node.js runtime only).
export function initOtelProviders(): void {
  const token = process.env.AXIOM_TOKEN;
  const dataset = process.env.AXIOM_DATASET;

  if (!token || !dataset) return;

  const baseUrl = process.env.AXIOM_URL ?? 'https://api.axiom.co';
  const headers = {
    Authorization: `Bearer ${token}`,
    'X-Axiom-Dataset': dataset,
  };

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME ?? 'visa-calculator',
  });

  // ── Metrics ──────────────────────────────────────────────────────────────
  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({ url: `${baseUrl}/v1/metrics`, headers }),
        exportIntervalMillis: 30_000,
      }),
    ],
  });
  metrics.setGlobalMeterProvider(meterProvider);

  // ── Logs ─────────────────────────────────────────────────────────────────
  const loggerProvider = new LoggerProvider({
    resource,
    processors: [
      new BatchLogRecordProcessor({
        exporter: new OTLPLogExporter({ url: `${baseUrl}/v1/logs`, headers }),
      }),
    ],
  });
  logs.setGlobalLoggerProvider(loggerProvider);
}
