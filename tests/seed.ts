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
    {
      id: '4',
      email: 'four@test.com',
      passwordHash: hashSync('password-four', PASSWORD_SALT_ROUNDS),
    },
    // Dedicated seed user (non-numeric id, out of the '1'-'11' range other
    // tests dynamically create/consume) for the reset-password session-
    // revocation test, so it doesn't collide with unrelated test isolation.
    {
      id: 'password-reset-seed',
      email: 'password-reset-seed@test.com',
      passwordHash: hashSync('password-reset-seed', PASSWORD_SALT_ROUNDS),
    },
    // Dedicated seed user for the reset-password transaction-rollback test
    // (verifies a failure mid-transaction leaves nothing committed), kept
    // separate from the seed user above so the two tests can't interfere
    // with each other's password/session state across test files.
    {
      id: 'reset-password-rollback-seed',
      email: 'reset-password-rollback-seed@test.com',
      passwordHash: hashSync(
        'reset-password-rollback-seed',
        PASSWORD_SALT_ROUNDS
      ),
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
    {
      id: 4,
      visaStartDate: new Date(2025, 5, 5),
      visaExpiryDate: new Date(2030, 5, 5),
      arrivalDate: new Date(2025, 6, 5),
      userId: '4',
    },
  ]);
}
