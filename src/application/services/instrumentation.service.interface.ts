export interface IInstrumentationService {
  startSpan<T>(
    options: { name: string; op?: string; attributes?: Record<string, any> },
    callback: () => T
  ): T;
  instrumentServerAction<T>(
    name: string,
    options: Record<string, any>,
    callback: () => T
  ): Promise<T>;
  recordMetric(name: string, tags?: Record<string, string>): void;
}
