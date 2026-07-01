import { afterAll, beforeAll, expect, it } from 'vitest';
import { vi } from 'vitest';

import { getInjection } from '@/di/container';
import { AuthenticationError } from '@/src/entities/errors/auth';

const signInUseCase = getInjection('ISignInUseCase');
const requestEmailChangeUseCase = getInjection('IRequestEmailChangeUseCase');
const verifyEmailChangeUseCase = getInjection('IVerifyEmailChangeUseCase');
const getUserUseCase = getInjection('IGetUserUseCase');

let capturedOtp = '';

beforeAll(() => {
  vi.spyOn(global, 'fetch').mockImplementation(async (_url, options) => {
    // Capture OTP from the email body so tests can submit it
    const body = options?.body ? String(options.body) : '';
    const match = body.match(/\b(\d{6})\b/);
    if (match) capturedOtp = match[1];
    return new Response(null, { status: 200 });
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});

it('updates email on correct OTP', async () => {
  const { session } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  await requestEmailChangeUseCase(
    { email: 'verified-new@test.com' },
    session.userId
  );

  await verifyEmailChangeUseCase(capturedOtp, session.userId);
  await expect(getUserUseCase(session.userId)).resolves.toMatchObject({
    email: 'verified-new@test.com',
  });
});

it('throws on wrong OTP', async () => {
  const { session } = await signInUseCase({
    email: 'two@test.com',
    password: 'password-two',
  });

  await requestEmailChangeUseCase(
    { email: 'two-new@test.com' },
    session.userId
  );

  await expect(
    verifyEmailChangeUseCase('000000', session.userId)
  ).rejects.toBeInstanceOf(AuthenticationError);
});
