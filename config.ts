export const SESSION_COOKIE = 'auth_session';
export const PASSWORD_SALT_ROUNDS = 10;
export const SESSION_EXPIRY_MS = 1000 * 60 * 60 * 24 * 30;
export const SESSION_RENEWAL_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 15;
export const BLOOM_FILTER_EXPECTED_EMAILS = 10000;
export const BLOOM_FILTER_ERROR_RATE = 0.01;

// Locales the app actually serves. Keep in sync with `i18n/routing.ts`.
export const SUPPORTED_LOCALES = ['en', 'zh-Hant-HK'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'en';

// Trusted, server-configured origin used to build links (password reset,
// email verification, etc.) that get emailed to users.
//
// SECURITY: this must NEVER be derived from the incoming request's `Host`
// header. The `Host` header is attacker-controlled, and using it here would
// let an attacker poison password-reset/email-verification emails with a
// link to an attacker-controlled domain, leaking valid single-use tokens
// (CWE-640, "password reset poisoning").
function resolveAppUrl(): string {
  const configured = process.env.APP_URL;
  if (configured) {
    return configured.replace(/\/+$/, '');
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('APP_URL environment variable must be set in production');
  }
  return 'http://localhost:3000';
}

export const APP_URL = resolveAppUrl();
