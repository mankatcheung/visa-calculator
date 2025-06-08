import { z } from 'zod';

export const userSettingSchema = z.object({
  id: z.number(),
  visaStartDate: z.date(),
  visaExpiryDate: z.date(),
  arrivalDate: z.date(),
  userId: z.string(),
});

export type UserSetting = z.infer<typeof userSettingSchema>;

export const updateUserSettingSchema = userSettingSchema.pick({
  visaStartDate: true,
  visaExpiryDate: true,
  arrivalDate: true,
});

export type UserSettingUpdate = z.infer<typeof updateUserSettingSchema>;
