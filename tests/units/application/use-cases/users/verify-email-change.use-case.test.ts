import { afterAll, beforeAll, expect, it } from 'vitest';
import { vi } from 'vitest';

import { getInjection } from '@/di/container';
import { AuthenticationError } from '@/src/entities/errors/auth';

const signInUseCase = getInjection('ISignInUseCase');
const requestEmailChangeUseCase = getInjection('IRequestEmailChangeUseCase');
const verifyEmailChangeUseCase = getInjection('IVerifyEmailChangeUseCase');
const getUserUseCase = getInjection('IGetUserUseCase');
const sessionsRepository = getInjection('ISessionRepository');

let capturedOtp = '';

beforeAll(() => {
  vi.spyOn(global, 'fetch').mockImplementation(async (_url, options) => {
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

  await verifyEmailChangeUseCase(capturedOtp, session.userId, session.id);
  await expect(getUserUseCase(session.userId)).resolves.toMatchObject({
    email: 'verified-new@test.com',
  });
});

it('revokes other sessions on successful email change', async () => {
  const { session: sessionA } = await signInUseCase({
    email: 'four@test.com',
    password: 'password-four',
  });
  const { session: sessionB } = await signInUseCase({
    email: 'four@test.com',
    password: 'password-four',
  });

  await requestEmailChangeUseCase(
    { email: 'four-devices-new@test.com' },
    sessionA.userId
  );

  await verifyEmailChangeUseCase(capturedOtp, sessionA.userId, sessionA.id);

  // sessionA should still be valid (current session kept)
  await expect(
    sessionsRepository.getSession(sessionA.id)
  ).resolves.toBeTruthy();
  // sessionB should be revoked
  await expect(
    sessionsRepository.getSession(sessionB.id)
  ).resolves.toBeNull();
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
    verifyEmailChangeUseCase('000000', session.userId, session.id)
  ).rejects.toBeInstanceOf(AuthenticationError);
});
