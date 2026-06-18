import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// @testing-library/react's auto-cleanup relies on detecting a global
// `afterEach` (Jest-style globals). This project doesn't enable Vitest's
// `globals: true`, so it has to be registered explicitly.
afterEach(() => {
  cleanup();
});

if (typeof window !== 'undefined') {
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  if (!window.PointerEvent) {
    window.PointerEvent = MouseEvent as unknown as typeof PointerEvent;
  }
}
