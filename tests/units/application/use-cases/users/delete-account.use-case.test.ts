import { afterAll, beforeAll, expect, it, vi } from 'vitest';

import { getInjection } from '@/di/container';
import { AuthenticationError } from '@/src/entities/errors/auth';

const signUpUseCase = getInjection('ISignUpUseCase');
const createLeaveUseCase = getInjection('ICreateLeaveUseCase');
const createVisaUseCase = getInjection('ICreateVisaUseCase');
const deleteAccountUseCase = getInjection('IDeleteAccountUseCase');
const usersRepository = getInjection('IUsersRepository');
const leavesRepository = getInjection('ILeavesRepository');
const visasRepository = getInjection('IVisasRepository');
const sessionsRepository = getInjection('ISessionRepository');

beforeAll(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(null, { status: 200 })
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

it('deletes the user and every row referencing them', async () => {
  const { user, session } = await signUpUseCase({
    email: 'delete-account-success@test.com',
    password: 'delete-account-password',
    locale: 'en',
  });

  await createLeaveUseCase(
    {
      startDate: new Date(2025, 5, 1),
      endDate: new Date(2025, 5, 5),
    },
    user.id
  );

  await createVisaUseCase(
    {
      country: 'United Kingdom',
      name: 'Skilled Worker',
      startDate: new Date(2025, 5, 5),
      expiryDate: new Date(2030, 5, 5),
      arrivalDate: new Date(2025, 6, 5),
      maxStayDays: null,
      rollingWindowDays: null,
      qualifyingPeriodYears: 5,
      remarks: null,
    },
    user.id
  );

  await deleteAccountUseCase(
    {
      currentPassword: 'delete-account-password',
      currentPasswordHash: user.passwordHash,
      email: user.email,
    },
    user.id
  );

  await expect(usersRepository.getUser(user.id)).resolves.toBeUndefined();
  await expect(leavesRepository.getLeavesForUser(user.id)).resolves.toEqual([]);
  await expect(visasRepository.getVisasForUser(user.id)).resolves.toEqual([]);
  await expect(
    sessionsRepository.getSession(session.id)
  ).resolves.toBeUndefined();
});

it('throws for the wrong current password and deletes nothing', async () => {
  const { user } = await signUpUseCase({
    email: 'delete-account-wrong-password@test.com',
    password: 'delete-account-password',
    locale: 'en',
  });

  await expect(
    deleteAccountUseCase(
      {
        currentPassword: 'not-the-password',
        currentPasswordHash: user.passwordHash,
        email: user.email,
      },
      user.id
    )
  ).rejects.toBeInstanceOf(AuthenticationError);

  await expect(usersRepository.getUser(user.id)).resolves.toBeDefined();
});
