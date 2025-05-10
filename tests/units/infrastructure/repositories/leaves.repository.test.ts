import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';

const leavesRepository = getInjection('ILeavesRepository');

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('creates leave', async () => {
  const startDate = new Date(2025, 5, 7);
  const endDate = new Date(2025, 5, 10);

  await expect(
    leavesRepository.createLeave({
      startDate,
      endDate,
      color: '#333333',
      remarks: 'Testing remarks',
      userId: '1',
    })
  ).resolves.toMatchObject({
    startDate,
    endDate,
    color: '#333333',
    remarks: 'Testing remarks',
    userId: '1',
  });
});

it('update leave', async () => {
  const startDate = new Date(2025, 5, 7);
  const endDate = new Date(2025, 5, 10);

  const leave = await leavesRepository.createLeave({
    startDate,
    endDate,
    color: '#333333',
    remarks: 'Testing remarks',
    userId: '1',
  });
  const newStartDate = new Date(2025, 6, 7);
  const newEndDate = new Date(2025, 6, 10);
  await expect(
    leavesRepository.updateLeave(leave.id, {
      startDate: newStartDate,
      endDate: newEndDate,
      color: '#222222',
      remarks: 'New testing remarks',
    })
  ).resolves.toMatchObject({
    startDate: newStartDate,
    endDate: newEndDate,
    color: '#222222',
    remarks: 'New testing remarks',
    userId: '1',
  });
});

it('get leave', async () => {
  const startDate = new Date(2025, 5, 7);
  const endDate = new Date(2025, 5, 10);

  const leave = await leavesRepository.createLeave({
    startDate,
    endDate,
    color: '#333333',
    remarks: 'Testing remarks',
    userId: '1',
  });
  await expect(leavesRepository.getLeave(leave.id)).resolves.toMatchObject({
    id: leave.id,
    startDate,
    endDate,
    color: '#333333',
    remarks: 'Testing remarks',
    userId: '1',
  });
});

it('get leave for user', async () => {
  const startDate = new Date(2025, 5, 7);
  const endDate = new Date(2025, 5, 10);

  const leave = await leavesRepository.createLeave({
    startDate,
    endDate,
    color: '#333333',
    remarks: 'Testing remarks',
    userId: '3',
  });
  await expect(leavesRepository.getLeavesForUser('3')).resolves.toMatchObject([
    {
      id: leave.id,
      startDate,
      endDate,
      color: '#333333',
      remarks: 'Testing remarks',
      userId: '3',
    },
  ]);
});

it('delete leave', async () => {
  const startDate = new Date(2025, 5, 7);
  const endDate = new Date(2025, 5, 10);

  const leave = await leavesRepository.createLeave({
    startDate,
    endDate,
    color: '#333333',
    remarks: 'Testing remarks',
    userId: '1',
  });
  await expect(leavesRepository.deleteLeave(leave.id)).resolves.not.toThrow();
});
