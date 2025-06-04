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

export async function getUserSettingsForUser() {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'getUserSettingsForUser',
    { recordResponse: true },
    async () => {
      try {
        const getUserSettingsForUserController = getInjection(
          'IGetUserSettingsForUserController'
        );
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const settings = await getUserSettingsForUserController(token);

        return { result: settings };
      } catch (err) {
        if (err instanceof InputParseError) {
          return { error: err.message };
        }
        if (
          err instanceof AuthenticationError ||
          err instanceof UnauthenticatedError
        ) {
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
export async function updateUserSettings(formData: FormData) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'updateUserSettings',
    { recordResponse: true },
    async () => {
      try {
        const updateUserSettingsController = getInjection(
          'IUpdateUserSettingsController'
        );
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const data = Object.fromEntries(formData.entries());
        const settings = await updateUserSettingsController(data, token);
        revalidatePath('/[locale]');
        return { result: settings };
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
