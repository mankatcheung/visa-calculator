import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';

const sessionsRepository = getInjection('ISessionRepository');

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('creates session', async () => {
  const expiresAt = new Date(2025, 10, 2);
  await expect(
    sessionsRepository.createSession({
      id: 'sessionId-1',
      userId: '1',
      expiresAt,
    })
  ).resolves.toMatchObject({
    id: 'sessionId-1',
    userId: '1',
    expiresAt,
  });
});

it('get session', async () => {
  const expiresAt = new Date(2025, 10, 2);
  const sessionId = 'randomSessionId';
  await sessionsRepository.createSession({
    id: sessionId,
    userId: '2',
    expiresAt,
  });
  await expect(sessionsRepository.getSession(sessionId)).resolves.toMatchObject(
    {
      session: {
        id: sessionId,
        userId: '2',
        expiresAt,
      },
      user: {
        id: '2',
        email: 'two@test.com',
      },
    }
  );
});

it('get user session', async () => {
  const expiresAt = new Date(2025, 10, 2);
  await sessionsRepository.createSession({
    id: 'sessionId-3',
    userId: '3',
    expiresAt,
  });
  await expect(sessionsRepository.getUserSession('3')).resolves.toMatchObject({
    session: {
      id: 'sessionId-3',
      userId: '3',
      expiresAt,
    },
    user: {
      id: '3',
      email: 'three@test.com',
    },
  });
});

it('update session', async () => {
  const expiresAt = new Date(2025, 10, 2);
  await sessionsRepository.createSession({
    id: 'sessionId-5',
    userId: '1',
    expiresAt,
  });
  await sessionsRepository.updateSessionExpiresAt(
    'sessionId-5',
    new Date(2025, 11, 3)
  );
  await expect(
    sessionsRepository.getSession('sessionId-5')
  ).resolves.toMatchObject({
    session: {
      id: 'sessionId-5',
      userId: '1',
      expiresAt: new Date(2025, 11, 3),
    },
    user: {
      id: '1',
      email: 'one@test.com',
    },
  });
});

it('delete session', async () => {
  const expiresAt = new Date(2025, 10, 2);
  await sessionsRepository.createSession({
    id: 'sessionId-8',
    userId: '1',
    expiresAt,
  });
  await expect(
    sessionsRepository.deleteSession('sessionId-8')
  ).resolves.not.toThrow();
});

it('delete user session', async () => {
  const expiresAt = new Date(2025, 10, 2);
  await sessionsRepository.createSession({
    id: 'sessionId-7',
    userId: '1',
    expiresAt,
  });
  await expect(
    sessionsRepository.deleteUserSession('1')
  ).resolves.not.toThrow();
});
