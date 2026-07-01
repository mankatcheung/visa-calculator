'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { SESSION_COOKIE } from '@/config';

import { getInjection } from '@/di/container';
import {
  AuthenticationError,
  UnauthenticatedError,
} from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';

export async function getSelfUser() {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'getSelfUser',
    { recordResponse: true },
    async () => {
      try {
        const getSelfUserController = getInjection('IGetSelfUserController');
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const user = await getSelfUserController(token);

        return { result: user };
      } catch (err) {
        if (err instanceof InputParseError) {
          return { error: err.message };
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
    }
  );
}

export async function changePassword(formData: FormData) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'changePassword',
    { recordResponse: true },
    async () => {
      try {
        const updateUserPasswordController = getInjection(
          'IUpdateUserPasswordController'
        );
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const data = Object.fromEntries(formData.entries());
        const user = await updateUserPasswordController(data, token);

        return { result: user };
      } catch (err) {
        if (err instanceof InputParseError) {
          return { error: err.message };
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
    }
  );
}

export async function getPendingEmailChange() {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'getPendingEmailChange',
    { recordResponse: true },
    async () => {
      try {
        const controller = getInjection('IGetPendingEmailChangeController');
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const pendingEmail = await controller(token);
        return { result: pendingEmail };
      } catch (err) {
        if (
          err instanceof UnauthenticatedError ||
          err instanceof AuthenticationError
        ) {
          return { result: null };
        }
        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        return { result: null };
      }
    }
  );
}

export async function requestEmailChange(formData: FormData) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'requestEmailChange',
    { recordResponse: true },
    async () => {
      try {
        const controller = getInjection('IRequestEmailChangeController');
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const data = Object.fromEntries(formData.entries());
        const result = await controller(data, token);
        return { result };
      } catch (err) {
        if (err instanceof InputParseError) {
          return { error: err.message };
        }
        if (
          err instanceof AuthenticationError ||
          err instanceof UnauthenticatedError
        ) {
          return { error: err.message };
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

export async function verifyEmailChangeOtp(otp: string) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'verifyEmailChangeOtp',
    { recordResponse: true },
    async () => {
      try {
        const controller = getInjection('IVerifyEmailChangeController');
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        await controller({ otp }, token);
        revalidatePath('/[locale]');
        return { result: true };
      } catch (err) {
        if (err instanceof InputParseError) {
          return { error: err.message };
        }
        if (
          err instanceof AuthenticationError ||
          err instanceof UnauthenticatedError
        ) {
          return { error: err.message };
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

export async function cancelEmailChange() {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'cancelEmailChange',
    { recordResponse: true },
    async () => {
      try {
        const controller = getInjection('ICancelEmailChangeController');
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        await controller(token);
        return { result: true };
      } catch (err) {
        if (
          err instanceof AuthenticationError ||
          err instanceof UnauthenticatedError
        ) {
          return { error: err.message };
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
