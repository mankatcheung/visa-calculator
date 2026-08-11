import { z } from 'zod';

export const visaSchema = z.object({
  id: z.number(),
  userId: z.string(),
  country: z.string(),
  name: z.string(),
  startDate: z.date(),
  expiryDate: z.date(),
  arrivalDate: z.date(),
  maxStayDays: z.number().int().positive().nullable(),
  rollingWindowDays: z.number().int().positive().nullable(),
  qualifyingPeriodYears: z.number().int().positive().nullable(),
  remarks: z.string().nullable(),
  createdAt: z.date(),
});

export type Visa = z.infer<typeof visaSchema>;

export const createVisaSchema = visaSchema.omit({ id: true, userId: true, createdAt: true });
export type CreateVisa = z.infer<typeof createVisaSchema>;

export const updateVisaSchema = createVisaSchema.partial();
export type UpdateVisa = z.infer<typeof updateVisaSchema>;
