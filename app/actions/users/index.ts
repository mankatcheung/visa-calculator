'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { SESSION_COOKIE } from '@/config';

import { getInjection } from '@/di/container';
import { AuthenticationError } from '@/src/entities/errors/auth';
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

export async function updateEmail(formData: FormData) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'updateEmail',
    { recordResponse: true },
    async () => {
      try {
        const updateUserEmailController = getInjection(
          'IUpdateUserEmailController'
        );
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const data = Object.fromEntries(formData.entries());
        const user = await updateUserEmailController(data, token);

        revalidatePath('/[locale]');
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
