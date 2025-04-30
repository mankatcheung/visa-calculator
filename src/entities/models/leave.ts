import { z } from "zod";

export const leaveSchema = z.object({
  id: z.number(),
  created_at: z.date(),
  start_date: z.date(),
  end_date: z.date(),
  color: z.string().nullish(),
  remarks: z.string().nullish(),
  user_id: z.string(),
});

export type Leave = z.infer<typeof leaveSchema>;

export const insertLeaveSchema = leaveSchema.pick({
  start_date: true,
  end_date: true,
  remarks: true,
  color: true,
  user_id: true,
});

export type LeaveInsert = z.infer<typeof insertLeaveSchema>;

export const updateLeaveSchema = insertLeaveSchema.omit({
  user_id: true,
});

export type LeaveUpdate = z.infer<typeof updateLeaveSchema>;
