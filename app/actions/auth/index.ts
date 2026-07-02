'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { DEFAULT_LOCALE, SESSION_COOKIE, SUPPORTED_LOCALES } from '@/config';

import { getInjection } from '@/di/container';
import {
  AuthenticationError,
  UnauthenticatedError,
} from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';
import { Cookie } from '@/src/entities/models/cookie';

// SECURITY: resolves the current request's locale for building links that
// get emailed to users (password reset, email verification). The locale
// header is client-influenceable, but it only ever selects a path segment
// under our own trusted APP_URL — see `config.ts` — never the origin/host
// itself, so it cannot be used to redirect a link to an attacker's domain.
async function resolveLocale() {
  const headersList = await headers();
  const requested = headersList.get('x-your-custom-locale');
  return (SUPPORTED_LOCALES as readonly string[]).includes(requested ?? '')
    ? (requested as (typeof SUPPORTED_LOCALES)[number])
    : DEFAULT_LOCALE;
}

export async function signUp(formData: FormData) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'signUp',
    { recordResponse: true },
    async () => {
      const email = formData.get('email')?.toString();
      const password = formData.get('password')?.toString();
      const confirmPassword = formData.get('confirmPassword')?.toString();
      const locale = await resolveLocale();

      let sessionCookie: Cookie;
      try {
        const signUpController = getInjection('ISignUpController');
        const { cookie } = await signUpController({
          email,
          password,
          confirmPassword,
          locale,
        });
        sessionCookie = cookie;
      } catch (err) {
        if (err instanceof InputParseError) {
          return {
            error:
              'Invalid data. Make sure the Password and Confirm Password match.',
          };
        }
        if (err instanceof AuthenticationError) {
          return {
            error: err.message,
          };
        }
        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);

        return {
          error:
            'An error happened. The developers have been notified. Please try again later. Message: ' +
            (err as Error).message,
        };
      }

      const cookieStore = await cookies();

      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );

      redirect('/verify-email');
    }
  );
}

export async function verifyEmail(token: string) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'verifyEmail',
    { recordResponse: true },
    async () => {
      try {
        const controller = getInjection('IVerifyEmailController');
        await controller({ token });
      } catch (err) {
        if (err instanceof InputParseError) {
          return { error: 'Invalid verification link.' };
        }
        if (err instanceof AuthenticationError) {
          return { error: err.message };
        }
        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        return {
          error:
            'An error happened. The developers have been notified. Please try again later.',
        };
      }

      redirect('/');
    }
  );
}

export async function resendVerificationEmail() {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'resendVerificationEmail',
    { recordResponse: true },
    async () => {
      const cookiesStore = await cookies();
      const sessionId = cookiesStore.get(SESSION_COOKIE)?.value;
      if (!sessionId) {
        return { error: 'Not authenticated.' };
      }

      const locale = await resolveLocale();

      try {
        const authenticationService = getInjection('IAuthenticationService');
        const { user } = await authenticationService.validateSession(sessionId);
        const controller = getInjection('IResendVerificationEmailController');
        await controller({ userId: user.id, locale });
      } catch (err) {
        if (err instanceof InputParseError) {
          return { error: 'Invalid request.' };
        }
        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        return {
          error:
            'An error happened. The developers have been notified. Please try again later.',
        };
      }
    }
  );
}

export async function signIn(formData: FormData, redirectPath: string) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'signIn',
    { recordResponse: true },
    async () => {
      const email = formData.get('email')?.toString();
      const password = formData.get('password')?.toString();

      let sessionCookie: Cookie;
      try {
        const signInController = getInjection('ISignInController');
        sessionCookie = await signInController({ email, password });
      } catch (err) {
        if (
          err instanceof InputParseError ||
          err instanceof AuthenticationError
        ) {
          return {
            error: 'Incorrect email or password',
          };
        }
        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        return {
          error:
            'An error happened. The developers have been notified. Please try again later.',
        };
      }

      const cookieStore = await cookies();

      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );

      redirect(redirectPath);
    }
  );
}

export async function requestPasswordReset(formData: FormData) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'requestPasswordReset',
    { recordResponse: true },
    async () => {
      const email = formData.get('email')?.toString();
      const locale = await resolveLocale();

      try {
        const controller = getInjection('IRequestPasswordResetController');
        await controller({ email, locale });
      } catch (err) {
        if (err instanceof InputParseError) {
          return { error: 'Please enter a valid email address.' };
        }
        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        return {
          error:
            'An error happened. The developers have been notified. Please try again later.',
        };
      }
    }
  );
}

export async function resetPassword(formData: FormData) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'resetPassword',
    { recordResponse: true },
    async () => {
      const token = formData.get('token')?.toString();
      const password = formData.get('password')?.toString();
      const confirmPassword = formData.get('confirmPassword')?.toString();

      try {
        const controller = getInjection('IResetPasswordController');
        await controller({ token, password, confirmPassword });
      } catch (err) {
        if (err instanceof InputParseError) {
          return {
            error:
              'Invalid data. Make sure the passwords match and are at least 6 characters.',
          };
        }
        if (err instanceof AuthenticationError) {
          return { error: err.message };
        }
        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        return {
          error:
            'An error happened. The developers have been notified. Please try again later.',
        };
      }

      redirect('/sign-in');
    }
  );
}

export async function signOut() {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'signOut',
    { recordResponse: true },
    async () => {
      const cookiesStore = await cookies();
      const sessionId = cookiesStore.get(SESSION_COOKIE)?.value;

      let blankCookie: Cookie;
      try {
        const signOutController = getInjection('ISignOutController');
        blankCookie = await signOutController(sessionId);
      } catch (err) {
        if (
          err instanceof UnauthenticatedError ||
          err instanceof InputParseError
        ) {
          redirect('/sign-in');
        }
        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw err;
      }

      cookiesStore.set(
        blankCookie.name,
        blankCookie.value,
        blankCookie.attributes
      );

      redirect('/sign-in');
    }
  );
}
