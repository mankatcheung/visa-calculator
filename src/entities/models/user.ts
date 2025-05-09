import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  passwordHash: z.string().min(6).max(255),
});

export type User = z.infer<typeof userSchema>;

export const createUserSchema = userSchema
  .pick({ id: true, email: true })
  .merge(z.object({ password: z.string().min(6).max(255) }));
export const updateUserSchema = createUserSchema.omit({ id: true });
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
