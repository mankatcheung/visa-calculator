import { z } from 'zod';

export const userSettingSchema = z.object({
  id: z.number(),
  visaStartDate: z.date(),
  userId: z.string(),
});

export type UserSetting = z.infer<typeof userSettingSchema>;

export const updateUserSettingSchema = userSettingSchema.pick({
  visaStartDate: true,
});

export type UserSettingUpdate = z.infer<typeof updateUserSettingSchema>;
