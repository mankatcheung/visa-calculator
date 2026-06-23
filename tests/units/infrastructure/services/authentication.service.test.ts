import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { expect, it } from 'vitest';

import { SESSION_COOKIE, SESSION_RENEWAL_THRESHOLD_MS } from '@/config';
import { getInjection } from '@/di/container';

const authenticationService = getInjection('IAuthenticationService');
const sessionsRepository = getInjection('ISessionRepository');

function hashToken(token: string): string {
  return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

it('renews the session and returns the renewed expiresAt when close to expiry', async () => {
  const token = 'renew-token';
  const almostExpired = new Date(
    Date.now() + SESSION_RENEWAL_THRESHOLD_MS - 1000
  );
  await sessionsRepository.createSession({
    id: hashToken(token),
    userId: '1',
    expiresAt: almostExpired,
  });

  const { session } = await authenticationService.validateSession(token);

  expect(session.expiresAt.getTime()).toBeGreaterThan(
    almostExpired.getTime()
  );
});

it('keeps the original expiresAt when not close to expiry', async () => {
  const token = 'no-renew-token';
  // drizzle's sqlite timestamp mode stores seconds, so round to avoid
  // a false mismatch from millisecond truncation on read-back
  const farExpiry = new Date(
    Math.floor((Date.now() + SESSION_RENEWAL_THRESHOLD_MS * 3) / 1000) * 1000
  );
  await sessionsRepository.createSession({
    id: hashToken(token),
    userId: '1',
    expiresAt: farExpiry,
  });

  const { session } = await authenticationService.validateSession(token);

  expect(session.expiresAt).toEqual(farExpiry);
});

it('builds a session cookie carrying the given token and expiry', () => {
  const expiresAt = new Date(2030, 0, 1);
  const cookie = authenticationService.buildSessionCookie(
    'my-token',
    expiresAt
  );

  expect(cookie).toMatchObject({
    name: SESSION_COOKIE,
    value: 'my-token',
    attributes: {
      path: '/',
      expires: expiresAt,
      sameSite: 'lax',
      httpOnly: true,
    },
  });
});
