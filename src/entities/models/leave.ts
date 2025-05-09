import { z } from 'zod';

export const leaveSchema = z.object({
  id: z.number(),
  createdAt: z.date(),
  startDate: z.date(),
  endDate: z.date(),
  color: z.string().nullish(),
  remarks: z.string().nullish(),
  userId: z.string(),
});

export type Leave = z.infer<typeof leaveSchema>;

export const insertLeaveSchema = leaveSchema.pick({
  startDate: true,
  endDate: true,
  remarks: true,
  color: true,
  userId: true,
});

export type LeaveInsert = z.infer<typeof insertLeaveSchema>;

export const updateLeaveSchema = insertLeaveSchema.omit({
  userId: true,
});

export type LeaveUpdate = z.infer<typeof updateLeaveSchema>;
