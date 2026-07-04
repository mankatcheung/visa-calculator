export type InvalidationEvent =
  | { type: 'key'; key: string }
  | { type: 'prefix'; prefix: string };

export interface ICacheInvalidationRelay {
  publish(event: InvalidationEvent): Promise<void>;
  subscribe(
    handler: (event: InvalidationEvent) => void,
    pollIntervalMs?: number
  ): void;
  close(): void;
}
