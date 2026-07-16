import { addYears } from 'date-fns';

import { getLeaveDaysSince } from '@/lib/leave';
import type { Visa } from '@/src/entities/models/visa';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const EXPIRING_SOON_THRESHOLD_DAYS = 30;

export interface VisaStatus {
  daysUntilExpiry: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysSinceArrival: number;
  totalVisaDurationDays: number;
  daysUsedInWindow: number | null;
  daysRemainingInWindow: number | null;
  qualifyingProgressPct: number | null;
  qualifyingDate: Date | null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

export function getVisaStatus(
  visa: Pick<
    Visa,
    | 'startDate'
    | 'expiryDate'
    | 'arrivalDate'
    | 'maxStayDays'
    | 'rollingWindowDays'
    | 'qualifyingPeriodYears'
  >,
  leaves: { startDate: Date; endDate: Date }[] = [],
  today: Date = new Date()
): VisaStatus {
  const daysUntilExpiry = Math.ceil(
    (visa.expiryDate.getTime() - today.getTime()) / MS_PER_DAY
  );
  const daysSinceArrival = Math.max(
    0,
    Math.ceil((today.getTime() - visa.arrivalDate.getTime()) / MS_PER_DAY)
  );
  const totalVisaDurationDays = Math.ceil(
    (visa.expiryDate.getTime() - visa.startDate.getTime()) / MS_PER_DAY
  );

  let daysUsedInWindow: number | null = null;
  let daysRemainingInWindow: number | null = null;
  if (visa.maxStayDays != null && visa.rollingWindowDays != null) {
    daysUsedInWindow = getLeaveDaysSince(leaves, visa.rollingWindowDays);
    daysRemainingInWindow = Math.max(0, visa.maxStayDays - daysUsedInWindow);
  }

  let qualifyingProgressPct: number | null = null;
  let qualifyingDate: Date | null = null;
  if (visa.qualifyingPeriodYears != null) {
    const totalDays = visa.qualifyingPeriodYears * 365;
    qualifyingProgressPct = clamp((daysSinceArrival / totalDays) * 100, 0, 100);
    qualifyingDate = addYears(visa.arrivalDate, visa.qualifyingPeriodYears);
  }

  return {
    daysUntilExpiry,
    isExpired: daysUntilExpiry <= 0,
    isExpiringSoon: daysUntilExpiry > 0 && daysUntilExpiry <= EXPIRING_SOON_THRESHOLD_DAYS,
    daysSinceArrival,
    totalVisaDurationDays,
    daysUsedInWindow,
    daysRemainingInWindow,
    qualifyingProgressPct,
    qualifyingDate,
  };
}
