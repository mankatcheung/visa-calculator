import { describe, expect, it } from 'vitest';

import {
  YEARS_TO_CITIZENSHIP,
  YEARS_TO_ILR,
  getVisaStatus,
} from '@/lib/visa';

const visaStartDate = new Date(2020, 0, 1);
const arrivalDate = new Date(2020, 0, 1);
const visaExpiryDate = new Date(2025, 0, 1);
const today = new Date(2022, 0, 1);

describe('getVisaStatus', () => {
  it('computes the ILR and citizenship application dates from arrival', () => {
    const status = getVisaStatus(
      { visaStartDate, visaExpiryDate, arrivalDate },
      today
    );

    expect(status.applyILRDate).toEqual(new Date(2025, 0, 1));
    expect(status.applyCitizenshipDate).toEqual(new Date(2026, 0, 1));
  });

  it('computes the extend-by date as 28 days before expiry', () => {
    const status = getVisaStatus(
      { visaStartDate, visaExpiryDate, arrivalDate },
      today
    );

    expect(status.extendVisaByDate).toEqual(new Date(2024, 11, 4));
  });

  describe('shouldExtendVisa', () => {
    it('is true when the visa is granted for less than 5 years from arrival', () => {
      const status = getVisaStatus(
        {
          visaStartDate,
          arrivalDate,
          visaExpiryDate: new Date(2024, 11, 31),
        },
        today
      );

      expect(status.shouldExtendVisa).toBe(true);
    });

    it('is false when the visa already covers a full 5 years from arrival', () => {
      const status = getVisaStatus(
        {
          visaStartDate,
          arrivalDate,
          visaExpiryDate: new Date(2025, 0, 1),
        },
        today
      );

      expect(status.shouldExtendVisa).toBe(false);
    });
  });

  describe('isExpired / isExpiringSoon', () => {
    it('flags the visa as expired once expiry is today', () => {
      const status = getVisaStatus(
        { visaStartDate, arrivalDate, visaExpiryDate: today },
        today
      );

      expect(status.isExpired).toBe(true);
      expect(status.isExpiringSoon).toBe(false);
    });

    it('flags the visa as expired once expiry is in the past', () => {
      const status = getVisaStatus(
        {
          visaStartDate,
          arrivalDate,
          visaExpiryDate: new Date(2021, 11, 31),
        },
        today
      );

      expect(status.isExpired).toBe(true);
      expect(status.isExpiringSoon).toBe(false);
    });

    it('flags the visa as expiring soon when expiry is within 30 days', () => {
      const status = getVisaStatus(
        {
          visaStartDate,
          arrivalDate,
          visaExpiryDate: new Date(2022, 0, 31),
        },
        today
      );

      expect(status.isExpired).toBe(false);
      expect(status.isExpiringSoon).toBe(true);
    });

    it('does not flag the visa as expiring soon when expiry is more than 30 days away', () => {
      const status = getVisaStatus(
        {
          visaStartDate,
          arrivalDate,
          visaExpiryDate: new Date(2022, 1, 1),
        },
        today
      );

      expect(status.isExpired).toBe(false);
      expect(status.isExpiringSoon).toBe(false);
    });
  });

  describe('progressPercentage', () => {
    it('clamps to 0 when arrival is in the future', () => {
      const status = getVisaStatus(
        {
          visaStartDate,
          visaExpiryDate,
          arrivalDate: new Date(2023, 0, 1),
        },
        today
      );

      expect(status.progressPercentage).toBe(0);
    });

    it('clamps to 100 once the full qualifying period has elapsed', () => {
      const status = getVisaStatus(
        { visaStartDate, visaExpiryDate, arrivalDate },
        new Date(2030, 0, 1)
      );

      expect(status.progressPercentage).toBe(100);
    });
  });

  describe('visaExpiryPercentage', () => {
    it('clamps to 100 when the visa duration exceeds the qualifying period', () => {
      const status = getVisaStatus(
        {
          visaStartDate,
          arrivalDate,
          visaExpiryDate: new Date(2030, 0, 1),
        },
        today
      );

      expect(status.visaExpiryPercentage).toBe(100);
    });
  });

  it('reports a constant ILR percentage derived from the qualifying years', () => {
    const status = getVisaStatus(
      { visaStartDate, visaExpiryDate, arrivalDate },
      today
    );

    expect(status.ilrPercentage).toBe(
      Math.round((YEARS_TO_ILR / (YEARS_TO_ILR + YEARS_TO_CITIZENSHIP)) * 100)
    );
  });

  describe('daysSinceArrival', () => {
    it('floors at 0 when arrival is in the future', () => {
      const status = getVisaStatus(
        {
          visaStartDate,
          visaExpiryDate,
          arrivalDate: new Date(2023, 0, 1),
        },
        today
      );

      expect(status.daysSinceArrival).toBe(0);
    });

    it('counts whole days elapsed since arrival', () => {
      const status = getVisaStatus(
        { visaStartDate, visaExpiryDate, arrivalDate },
        new Date(2020, 0, 11)
      );

      expect(status.daysSinceArrival).toBe(10);
    });
  });

  it('computes the total visa duration in days', () => {
    const status = getVisaStatus(
      {
        visaStartDate: new Date(2020, 0, 1),
        visaExpiryDate: new Date(2020, 0, 11),
        arrivalDate,
      },
      today
    );

    expect(status.totalVisaDurationDays).toBe(10);
  });
});
