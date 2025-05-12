import { compare } from 'bcrypt-ts';
import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';

const usersRepository = getInjection('IUsersRepository');

it('creates user', async () => {
  await expect(
    usersRepository.createUser({
      id: '5',
      email: 'five@test.com',
      password: 'password-five',
    })
  ).resolves.toMatchObject({
    id: '5',
    email: 'five@test.com',
  });
});

it('get user', async () => {
  await usersRepository.createUser({
    id: '6',
    email: 'six@test.com',
    password: 'password-six',
  });
  await expect(usersRepository.getUser('6')).resolves.toMatchObject({
    id: '6',
    email: 'six@test.com',
  });
});

it('get user by email', async () => {
  await usersRepository.createUser({
    id: '7',
    email: 'seven@test.com',
    password: 'password-seven',
  });
  await expect(
    usersRepository.getUserByEmail('seven@test.com')
  ).resolves.toMatchObject({
    id: '7',
    email: 'seven@test.com',
  });
});

it('update user', async () => {
  await usersRepository.createUser({
    id: '8',
    email: 'eight@test.com',
    password: 'password-eight',
  });
  await usersRepository.updateUser('8', {
    email: 'eight-new@test.com',
    password: 'password-eight-new',
  });
  const newUser = await usersRepository.getUser('8');
  expect(newUser).toMatchObject({
    id: '8',
    email: 'eight-new@test.com',
  });
  const passwordMatched = await compare(
    'password-eight-new',
    newUser?.passwordHash || ''
  );
  expect(newUser).not.toBeNull();
  expect(newUser?.passwordHash).toBeDefined();
  expect(passwordMatched).toBe(true);
});

it('should return undefined when getting a non-existent user', async () => {
  await expect(
    usersRepository.getUser('non-existent-id')
  ).resolves.toBeUndefined();
});

it('should return undefined when getting a user with non-existent email', async () => {
  await expect(
    usersRepository.getUserByEmail('non-existent@test.com')
  ).resolves.toBeUndefined();
});
