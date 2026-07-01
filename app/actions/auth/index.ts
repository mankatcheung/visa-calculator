'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE } from '@/config';

import { getInjection } from '@/di/container';
import {
  AuthenticationError,
  UnauthenticatedError,
} from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';
import { Cookie } from '@/src/entities/models/cookie';

export async function signUp(formData: FormData) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'signUp',
    { recordResponse: true },
    async () => {
      const email = formData.get('email')?.toString();
      const password = formData.get('password')?.toString();
      const confirmPassword = formData.get('confirmPassword')?.toString();

      const headersList = await headers();
      const host = headersList.get('host') ?? 'localhost:3000';
      const protocol =
        process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const locale = headersList.get('x-your-custom-locale') ?? 'en';
      const verifyBaseUrl = `${protocol}://${host}/${locale}/verify-email`;

      let sessionCookie: Cookie;
      try {
        const signUpController = getInjection('ISignUpController');
        const { cookie } = await signUpController({
          email,
          password,
          confirmPassword,
          verifyBaseUrl,
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

      const headersList = await headers();
      const host = headersList.get('host') ?? 'localhost:3000';
      const protocol =
        process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const locale = headersList.get('x-your-custom-locale') ?? 'en';
      const verifyBaseUrl = `${protocol}://${host}/${locale}/verify-email`;

      try {
        const authenticationService = getInjection('IAuthenticationService');
        const { user } = await authenticationService.validateSession(sessionId);
        const controller = getInjection('IResendVerificationEmailController');
        await controller({ userId: user.id, verifyBaseUrl });
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
      const headersList = await headers();
      const host = headersList.get('host') ?? 'localhost:3000';
      const protocol =
        process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const locale = headersList.get('x-your-custom-locale') ?? 'en';
      const resetBaseUrl = `${protocol}://${host}/${locale}/reset-password`;

      try {
        const controller = getInjection('IRequestPasswordResetController');
        await controller({ email, resetBaseUrl });
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
