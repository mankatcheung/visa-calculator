import { describe, expect, it } from 'vitest';

import { getVisaStatus } from '@/lib/visa';

const startDate = new Date(2020, 0, 1);
const arrivalDate = new Date(2020, 0, 1);
const expiryDate = new Date(2025, 0, 1);
const today = new Date(2022, 0, 1);

const baseVisa = {
  startDate,
  expiryDate,
  arrivalDate,
  maxStayDays: null,
  rollingWindowDays: null,
  qualifyingPeriodYears: null,
};

describe('getVisaStatus', () => {
  describe('isExpired / isExpiringSoon', () => {
    it('flags the visa as expired when expiry equals today', () => {
      const status = getVisaStatus({ ...baseVisa, expiryDate: today }, [], today);
      expect(status.isExpired).toBe(true);
      expect(status.isExpiringSoon).toBe(false);
    });

    it('flags the visa as expired when expiry is in the past', () => {
      const status = getVisaStatus(
        { ...baseVisa, expiryDate: new Date(2021, 11, 31) },
        [],
        today
      );
      expect(status.isExpired).toBe(true);
      expect(status.isExpiringSoon).toBe(false);
    });

    it('flags the visa as expiring soon when expiry is within 30 days', () => {
      const status = getVisaStatus(
        { ...baseVisa, expiryDate: new Date(2022, 0, 31) },
        [],
        today
      );
      expect(status.isExpired).toBe(false);
      expect(status.isExpiringSoon).toBe(true);
    });

    it('does not flag as expiring soon when expiry is more than 30 days away', () => {
      const status = getVisaStatus(
        { ...baseVisa, expiryDate: new Date(2022, 1, 1) },
        [],
        today
      );
      expect(status.isExpired).toBe(false);
      expect(status.isExpiringSoon).toBe(false);
    });
  });

  describe('daysSinceArrival', () => {
    it('floors at 0 when arrival is in the future', () => {
      const status = getVisaStatus(
        { ...baseVisa, arrivalDate: new Date(2023, 0, 1) },
        [],
        today
      );
      expect(status.daysSinceArrival).toBe(0);
    });

    it('counts whole days elapsed since arrival', () => {
      const status = getVisaStatus(baseVisa, [], new Date(2020, 0, 11));
      expect(status.daysSinceArrival).toBe(10);
    });
  });

  it('computes the total visa duration in days', () => {
    const status = getVisaStatus(
      { ...baseVisa, startDate: new Date(2020, 0, 1), expiryDate: new Date(2020, 0, 11) },
      [],
      today
    );
    expect(status.totalVisaDurationDays).toBe(10);
  });

  describe('rolling-window stay rule', () => {
    it('returns null when no rule is configured', () => {
      const status = getVisaStatus(baseVisa, [], today);
      expect(status.daysUsedInWindow).toBeNull();
      expect(status.daysRemainingInWindow).toBeNull();
    });

    it('computes used and remaining days for a rule', () => {
      const visa = { ...baseVisa, maxStayDays: 90, rollingWindowDays: 180 };
      const leaves = [{ startDate: new Date(2021, 6, 1), endDate: new Date(2021, 6, 10) }];
      const status = getVisaStatus(visa, leaves, today);
      expect(status.daysUsedInWindow).toBeGreaterThanOrEqual(0);
      expect(status.daysRemainingInWindow).toBeGreaterThanOrEqual(0);
      expect((status.daysUsedInWindow ?? 0) + (status.daysRemainingInWindow ?? 0)).toBe(90);
    });
  });

  describe('qualifying period', () => {
    it('returns null when no qualifying period is configured', () => {
      const status = getVisaStatus(baseVisa, [], today);
      expect(status.qualifyingProgressPct).toBeNull();
      expect(status.qualifyingDate).toBeNull();
    });

    it('clamps progress to 0 when arrival is in the future', () => {
      const visa = { ...baseVisa, arrivalDate: new Date(2023, 0, 1), qualifyingPeriodYears: 5 };
      const status = getVisaStatus(visa, [], today);
      expect(status.qualifyingProgressPct).toBe(0);
    });

    it('clamps progress to 100 once the full qualifying period has elapsed', () => {
      const visa = { ...baseVisa, qualifyingPeriodYears: 5 };
      const status = getVisaStatus(visa, [], new Date(2030, 0, 1));
      expect(status.qualifyingProgressPct).toBe(100);
    });

    it('computes the qualifying date as arrivalDate + qualifyingPeriodYears', () => {
      const visa = { ...baseVisa, qualifyingPeriodYears: 5 };
      const status = getVisaStatus(visa, [], today);
      expect(status.qualifyingDate).toEqual(new Date(2025, 0, 1));
    });
  });
});
