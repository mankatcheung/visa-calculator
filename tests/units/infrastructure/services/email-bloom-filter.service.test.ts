import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';

const emailBloomFilterService = getInjection('IEmailBloomFilterService');

it('returns true for an email already in the database', async () => {
  await expect(
    emailBloomFilterService.mightContainEmail('one@test.com')
  ).resolves.toBe(true);
});

it('returns false for an email that has never been seen', async () => {
  await expect(
    emailBloomFilterService.mightContainEmail(
      'definitely-not-registered@test.com'
    )
  ).resolves.toBe(false);
});

it('returns true after recording a new email', async () => {
  await emailBloomFilterService.recordEmail('freshly-recorded@test.com');
  await expect(
    emailBloomFilterService.mightContainEmail('freshly-recorded@test.com')
  ).resolves.toBe(true);
});
