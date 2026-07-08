import { SeverityNumber, logs } from '@opentelemetry/api-logs';

import { ILoggerService } from '@/src/application/services/logger.service.interface';

const SERVICE_NAME = process.env.OTEL_SERVICE_NAME ?? 'visa-calculator';

export class LoggerService implements ILoggerService {
  private emit(severity: SeverityNumber, message: string, attrs?: Record<string, unknown>): void {
    logs.getLogger(SERVICE_NAME).emit({
      severityNumber: severity,
      severityText: SeverityNumber[severity],
      body: message,
      attributes: attrs as Record<string, string | number | boolean>,
    });
  }

  debug(message: string, attrs?: Record<string, unknown>): void {
    this.emit(SeverityNumber.DEBUG, message, attrs);
  }

  info(message: string, attrs?: Record<string, unknown>): void {
    this.emit(SeverityNumber.INFO, message, attrs);
  }

  warn(message: string, attrs?: Record<string, unknown>): void {
    this.emit(SeverityNumber.WARN, message, attrs);
  }

  error(message: string, attrs?: Record<string, unknown>): void {
    this.emit(SeverityNumber.ERROR, message, attrs);
  }
}
