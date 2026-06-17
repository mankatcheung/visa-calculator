import { addYears, differenceInYears, subDays } from 'date-fns';

export const YEARS_TO_ILR = 5;
export const YEARS_TO_CITIZENSHIP = 1;

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const QUALIFYING_PERIOD_DAYS = (YEARS_TO_ILR + YEARS_TO_CITIZENSHIP) * 365;
const EXTEND_VISA_BEFORE_EXPIRY_DAYS = 28;
const EXPIRING_SOON_THRESHOLD_DAYS = 30;

export interface VisaTimeline {
  visaStartDate: Date;
  visaExpiryDate: Date;
  arrivalDate: Date;
}

export interface VisaStatus {
  applyILRDate: Date;
  applyCitizenshipDate: Date;
  extendVisaByDate: Date;
  totalVisaDurationDays: number;
  daysSinceArrival: number;
  daysUntilExpiry: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  shouldExtendVisa: boolean;
  progressPercentage: number;
  visaExpiryPercentage: number;
  ilrPercentage: number;
}

function clampPercentage(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)));
}

export function getVisaStatus(
  { visaStartDate, visaExpiryDate, arrivalDate }: VisaTimeline,
  today: Date = new Date()
): VisaStatus {
  const applyILRDate = addYears(arrivalDate, YEARS_TO_ILR);
  const applyCitizenshipDate = addYears(applyILRDate, YEARS_TO_CITIZENSHIP);

  const daysSinceArrival = Math.max(
    0,
    Math.ceil((today.getTime() - arrivalDate.getTime()) / MS_PER_DAY)
  );
  const daysUntilExpiry = Math.ceil(
    (visaExpiryDate.getTime() - today.getTime()) / MS_PER_DAY
  );
  const arrivalUntilExpiry = Math.ceil(
    (visaExpiryDate.getTime() - arrivalDate.getTime()) / MS_PER_DAY
  );
  const daysStayed = (today.getTime() - arrivalDate.getTime()) / MS_PER_DAY;

  return {
    applyILRDate,
    applyCitizenshipDate,
    extendVisaByDate: subDays(visaExpiryDate, EXTEND_VISA_BEFORE_EXPIRY_DAYS),
    totalVisaDurationDays: Math.ceil(
      (visaExpiryDate.getTime() - visaStartDate.getTime()) / MS_PER_DAY
    ),
    daysSinceArrival,
    daysUntilExpiry,
    isExpired: daysUntilExpiry <= 0,
    isExpiringSoon:
      daysUntilExpiry <= EXPIRING_SOON_THRESHOLD_DAYS && daysUntilExpiry > 0,
    shouldExtendVisa:
      differenceInYears(visaExpiryDate, arrivalDate) < YEARS_TO_ILR,
    progressPercentage: clampPercentage(
      (daysStayed / QUALIFYING_PERIOD_DAYS) * 100
    ),
    visaExpiryPercentage: clampPercentage(
      (arrivalUntilExpiry / QUALIFYING_PERIOD_DAYS) * 100
    ),
    ilrPercentage: clampPercentage(
      (YEARS_TO_ILR / (YEARS_TO_ILR + YEARS_TO_CITIZENSHIP)) * 100
    ),
  };
}
