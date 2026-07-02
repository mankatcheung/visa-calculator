// Lightweight, dependency-free password strength heuristic.
//
// Deliberately not using a library like zxcvbn here: this app's sign-up
// page is covered by a Lighthouse CI performance budget
// (categories:performance >= 0.7, see lighthouserc.js), and zxcvbn's
// bundled dictionaries are large enough to put that at real risk for a
// "nice to have" UI hint. This heuristic is simpler and won't catch
// everything a dictionary-based tool would (e.g. leetspeak substitutions
// like "P@ssw0rd"), but it's a reasonable, honest tradeoff for a
// client-side-only strength *indicator* -- the real security boundary is
// still server-side length validation (see the zod schemas), not this
// meter.

export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

export const PASSWORD_STRENGTH_LABEL_KEYS: Record<
  PasswordStrengthScore,
  string
> = {
  0: 'passwordStrengthVeryWeak',
  1: 'passwordStrengthWeak',
  2: 'passwordStrengthFair',
  3: 'passwordStrengthGood',
  4: 'passwordStrengthStrong',
};

// A small, non-exhaustive list of the most commonly breached/guessed
// passwords. Not meant to be comprehensive -- just enough to catch the
// obvious cases without shipping a large wordlist.
const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'p@ssword',
  'p@ssw0rd',
  'passw0rd',
  '123456',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty',
  'qwerty123',
  'letmein',
  'welcome',
  'welcome1',
  'admin',
  'administrator',
  'iloveyou',
  'monkey',
  'dragon',
  'football',
  'baseball',
  'trustno1',
  'abc123',
  '111111',
  '123123',
  'sunshine',
  'master',
  'shadow',
  'superman',
  'princess',
  'starwars',
]);

const SEQUENTIAL_PATTERNS = [
  '0123456789',
  'abcdefghijklmnopqrstuvwxyz',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
];

function hasSequentialRun(password: string, minRun = 4): boolean {
  const lower = password.toLowerCase();
  return SEQUENTIAL_PATTERNS.some((pattern) => {
    for (let i = 0; i <= pattern.length - minRun; i++) {
      const forward = pattern.slice(i, i + minRun);
      const backward = [...forward].reverse().join('');
      if (lower.includes(forward) || lower.includes(backward)) {
        return true;
      }
    }
    return false;
  });
}

function isAllSameCharacter(password: string): boolean {
  return password.length > 1 && new Set(password).size === 1;
}

export function getPasswordStrengthScore(
  password: string
): PasswordStrengthScore {
  if (!password) {
    return 0;
  }

  if (
    isAllSameCharacter(password) ||
    COMMON_PASSWORDS.has(password.toLowerCase())
  ) {
    return 0;
  }

  let score = 0;

  const length = password.length;
  if (length >= 8) score += 1;
  if (length >= 10) score += 1;
  if (length >= 14) score += 1;

  let varietyCount = 0;
  if (/[a-z]/.test(password)) varietyCount++;
  if (/[A-Z]/.test(password)) varietyCount++;
  if (/[0-9]/.test(password)) varietyCount++;
  if (/[^a-zA-Z0-9]/.test(password)) varietyCount++;
  if (varietyCount >= 3) score += 1;
  if (varietyCount === 4) score += 1;

  if (hasSequentialRun(password)) {
    score -= 2;
  }

  return Math.max(0, Math.min(4, score)) as PasswordStrengthScore;
}
