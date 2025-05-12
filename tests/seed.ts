import { db } from '@/drizzle';
import { hashSync } from 'bcrypt-ts';

import { PASSWORD_SALT_ROUNDS } from '@/config';

import { users } from '@/drizzle/schema';

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
}
