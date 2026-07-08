import { SpanStatusCode, metrics, trace } from '@opentelemetry/api';

import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';

const SERVICE_NAME = process.env.OTEL_SERVICE_NAME ?? 'visa-calculator';

export class InstrumentationService implements IInstrumentationService {
  startSpan<T>(
    options: { name: string; op?: string; attributes?: Record<string, any> },
    callback: () => T
  ): T {
    const tracer = trace.getTracer(SERVICE_NAME);
    const attrs = {
      ...(options.attributes ?? {}),
      ...(options.op ? { op: options.op } : {}),
    };
    return tracer.startActiveSpan(options.name, { attributes: attrs }, (span) => {
      const result = callback();
      if (result instanceof Promise) {
        return result
          .then((v) => {
            span.setStatus({ code: SpanStatusCode.OK });
            return v;
          })
          .catch((err: unknown) => {
            if (err instanceof Error) span.recordException(err);
            span.setStatus({ code: SpanStatusCode.ERROR });
            throw err;
          })
          .finally(() => span.end()) as unknown as T;
      }
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      return result;
    }) as T;
  }

  instrumentServerAction<T>(
    name: string,
    _options: Record<string, any>,
    callback: () => T
  ): Promise<T> {
    return this.startSpan({ name, op: 'server_action' }, callback) as Promise<T>;
  }

  // Counter increments flow through the OTel MeterProvider to Axiom.
  recordMetric(name: string, tags?: Record<string, string>): void {
    metrics.getMeter(SERVICE_NAME).createCounter(name).add(1, tags);
  }
}
