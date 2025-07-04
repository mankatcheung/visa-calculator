'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE } from '@/config';

import { getInjection } from '@/di/container';
import {
  AuthenticationError,
  UnauthenticatedError,
} from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';

export async function getLeavesForUser() {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.startSpan(
    {
      name: 'getLeavesForUser',
    },
    async () => {
      try {
        const getLeaveForUserController = getInjection(
          'IGetLeavesForUserController'
        );
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const leaves = await getLeaveForUserController(token);
        return { result: leaves };
      } catch (err) {
        if (
          err instanceof UnauthenticatedError ||
          err instanceof AuthenticationError
        ) {
          redirect('/sign-in');
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
export async function createLeave(formData: FormData) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'createLeave',
    { recordResponse: true },
    async () => {
      try {
        const createLeaveController = getInjection('ICreateLeaveController');
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const data = Object.fromEntries(formData.entries());
        const leave = await createLeaveController(data, token);
        revalidatePath('/[locale]');
        revalidatePath('/[locale]/leaves');
        return { result: leave };
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

export async function updateLeave(formData: FormData) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'updateLeave',
    { recordResponse: true },
    async () => {
      try {
        const updateLeaveController = getInjection('IUpdateLeaveController');
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const data = Object.fromEntries(formData.entries());
        const leave = await updateLeaveController(data, token);
        revalidatePath('/[locale]');
        revalidatePath('/[locale]/leaves');
        return { result: leave };
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

export async function deleteLeave(id: number) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'deleteLeave',
    { recordResponse: true },
    async () => {
      try {
        const deleteLeaveController = getInjection('IDeleteLeaveController');
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        await deleteLeaveController({ leaveId: id }, token);
        revalidatePath('/[locale]');
        revalidatePath('/[locale]/leaves');
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
      return { success: 'ok' };
    }
  );
}
