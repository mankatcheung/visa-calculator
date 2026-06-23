import { expect, it } from 'vitest';

import { GET } from '@/app/api/health/route';

it('returns ok when the database is reachable', async () => {
  const response = await GET();

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ status: 'ok' });
});
