import * as Sentry from '@sentry/nextjs';

import { ILoggerService } from '@/src/application/services/logger.service.interface';

export class LoggerService implements ILoggerService {
  debug(message: string, attrs?: Record<string, unknown>): void {
    Sentry.logger.debug(message, attrs);
  }

  info(message: string, attrs?: Record<string, unknown>): void {
    Sentry.logger.info(message, attrs);
  }

  warn(message: string, attrs?: Record<string, unknown>): void {
    Sentry.logger.warn(message, attrs);
  }

  error(message: string, attrs?: Record<string, unknown>): void {
    Sentry.logger.error(message, attrs);
  }
}
