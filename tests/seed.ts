import { db } from '@/drizzle';
import { hashSync } from 'bcrypt-ts';

import { PASSWORD_SALT_ROUNDS } from '@/config';

import { userSettings, users } from '@/drizzle/schema';

export async function seed() {
  await db.insert(users).values([
    {
      id: '1',
      email: 'one@test.com',
      passwordHash: hashSync('password-one', PASSWORD_SALT_ROUNDS),
    },
    {
      id: '2',
      email: 'two@test.com',
      passwordHash: hashSync('password-two', PASSWORD_SALT_ROUNDS),
    },
    {
      id: '3',
      email: 'three@test.com',
      passwordHash: hashSync('password-three', PASSWORD_SALT_ROUNDS),
    },
  ]);
  await db.insert(userSettings).values([
    {
      id: 1,
      visaStartDate: new Date(2025, 5, 5),
      visaExpiryDate: new Date(2030, 5, 5),
      arrivalDate: new Date(2025, 6, 5),
      userId: '1',
    },
    {
      id: 2,
      visaStartDate: new Date(2025, 5, 5),
      visaExpiryDate: new Date(2030, 5, 5),
      arrivalDate: new Date(2025, 6, 5),
      userId: '2',
    },
    {
      id: 3,
      visaStartDate: new Date(2025, 5, 5),
      visaExpiryDate: new Date(2030, 5, 5),
      arrivalDate: new Date(2025, 6, 5),
      userId: '3',
    },
  ]);
}
