import { afterAll, beforeAll, expect, it, vi } from 'vitest';

import { SESSION_COOKIE } from '@/config';

import { getInjection } from '@/di/container';
import { UnauthenticatedError } from '@/src/entities/errors/auth';

const signUpUseCase = getInjection('ISignUpUseCase');
const deleteAccountController = getInjection('IDeleteAccountController');
const usersRepository = getInjection('IUsersRepository');
const sessionsRepository = getInjection('ISessionRepository');

beforeAll(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(null, { status: 200 })
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

it('deletes the account and returns a blank session cookie', async () => {
  const { user, cookie } = await signUpUseCase({
    email: 'delete-account-controller-success@test.com',
    password: 'delete-account-password',
    locale: 'en',
  });

  const { blankCookie } = await deleteAccountController(
    { currentPassword: 'delete-account-password' },
    cookie.value
  );

  expect(blankCookie).toMatchObject({ name: SESSION_COOKIE, value: '' });
  await expect(usersRepository.getUser(user.id)).resolves.toBeUndefined();
});

it('throws for the wrong current password and deletes nothing', async () => {
  const { user, cookie } = await signUpUseCase({
    email: 'delete-account-controller-wrong-password@test.com',
    password: 'delete-account-password',
    locale: 'en',
  });

  await expect(
    deleteAccountController(
      { currentPassword: 'not-the-password' },
      cookie.value
    )
  ).rejects.toThrow('Current password is incorrect');

  await expect(usersRepository.getUser(user.id)).resolves.toBeDefined();
});

it('throws for unauthenticated', async () => {
  await expect(
    deleteAccountController({ currentPassword: 'whatever' }, undefined)
  ).rejects.toBeInstanceOf(UnauthenticatedError);
});

it('rolls back the whole deletion if a later step fails, leaving nothing committed', async () => {
  const { user, cookie } = await signUpUseCase({
    email: 'delete-account-controller-rollback@test.com',
    password: 'delete-account-password',
    locale: 'en',
  });

  // Force the last write in the transaction (deleting the user row itself)
  // to fail, simulating a transient infra error after every other write
  // has already been queued but before the transaction commits.
  vi.spyOn(usersRepository, 'deleteUser').mockImplementationOnce(async () => {
    throw new Error('simulated failure');
  });

  await expect(
    deleteAccountController(
      { currentPassword: 'delete-account-password' },
      cookie.value
    )
  ).rejects.toThrow('simulated failure');

  // Nothing from the failed attempt should have been committed.
  await expect(usersRepository.getUser(user.id)).resolves.toBeDefined();
  await expect(sessionsRepository.getUserSession(user.id)).resolves.toBeTruthy();
});
