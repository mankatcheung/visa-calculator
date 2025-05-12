import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';

const signInUseCase = getInjection('ISignInUseCase');
const createLeaveUseCase = getInjection('ICreateLeaveUseCase');
const updateLeaveUseCase = getInjection('IUpdateLeaveUseCase');
const getLeaveUseCase = getInjection('IGetLeaveUseCase');

it('update leave', async () => {
  const { session } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  const startDate = new Date(2025, 5, 7);
  const endDate = new Date(2025, 5, 10);
  const leave = await createLeaveUseCase(
    {
      startDate,
      endDate,
      color: '#333333',
      remarks: 'Testing remarks',
    },
    session.userId
  );
  const updateValue = {
    id: leave.id,
    startDate: new Date(2025, 6, 1),
    endDate: new Date(2025, 6, 6),
    color: '#222222',
    remarks: 'New testing remarks',
  };

  await updateLeaveUseCase(updateValue, session.userId);
  await expect(
    getLeaveUseCase(leave.id, session.userId)
  ).resolves.toMatchObject({
    id: leave.id,
    startDate: new Date(2025, 6, 1),
    endDate: new Date(2025, 6, 6),
    color: '#222222',
    remarks: 'New testing remarks',
    userId: '1',
  });
});
