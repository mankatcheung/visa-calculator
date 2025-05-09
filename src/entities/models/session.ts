import { z } from 'zod';
import { User } from './user';

export const sessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  expiresAt: z.date(),
});

export type Session = z.infer<typeof sessionSchema>;

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
