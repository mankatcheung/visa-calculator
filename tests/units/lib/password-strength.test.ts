import { describe, expect, it } from 'vitest';

import { getPasswordStrengthScore } from '@/lib/password-strength';

describe('getPasswordStrengthScore', () => {
  it('returns 0 for an empty password', () => {
    expect(getPasswordStrengthScore('')).toBe(0);
  });

  it('returns 0 for a common password regardless of length', () => {
    expect(getPasswordStrengthScore('password')).toBe(0);
    expect(getPasswordStrengthScore('Password1')).toBeLessThanOrEqual(2);
    expect(getPasswordStrengthScore('qwerty123')).toBe(0);
  });

  it('returns 0 for a password made of a single repeated character', () => {
    expect(getPasswordStrengthScore('aaaaaaaaaa')).toBe(0);
  });

  it('penalizes sequential runs like sequential letters or digits', () => {
    expect(getPasswordStrengthScore('abcdefgh')).toBe(0);
    expect(getPasswordStrengthScore('12345678')).toBe(0);
  });

  it('scores a short, single-character-class password low', () => {
    expect(getPasswordStrengthScore('short1')).toBeLessThanOrEqual(1);
  });

  it('scores a longer password with some variety as fair or better', () => {
    const score = getPasswordStrengthScore('Sunflower72');
    expect(score).toBeGreaterThanOrEqual(2);
  });

  it('scores a long password with full character variety as strong', () => {
    expect(getPasswordStrengthScore('Tr0ub4dor&Xk9mPqLz!')).toBe(4);
  });

  it('is deterministic for the same input', () => {
    const password = 'Some-Reasonably-Good1';
    expect(getPasswordStrengthScore(password)).toBe(
      getPasswordStrengthScore(password)
    );
  });
});
