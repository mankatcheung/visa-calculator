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

export async function getVisasForUser() {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'getVisasForUser',
    { recordResponse: true },
    async () => {
      try {
        const controller = getInjection('IGetVisasForUserController');
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const visas = await controller(token);
        return { result: visas };
      } catch (err) {
        if (err instanceof InputParseError) return { error: err.message };
        if (err instanceof AuthenticationError || err instanceof UnauthenticatedError)
          return { error: err.message };
        getInjection('ICrashReporterService').report(err);
        return { error: 'An error happened. The developers have been notified. Please try again later.' };
      }
    }
  );
}

export async function getVisa(id: number) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'getVisa',
    { recordResponse: true },
    async () => {
      try {
        const controller = getInjection('IGetVisaController');
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const visa = await controller({ id }, token);
        return { result: visa };
      } catch (err) {
        if (err instanceof InputParseError) return { error: err.message };
        if (err instanceof AuthenticationError || err instanceof UnauthenticatedError)
          return { error: err.message };
        getInjection('ICrashReporterService').report(err);
        return { error: 'An error happened. The developers have been notified. Please try again later.' };
      }
    }
  );
}

export async function createVisa(formData: FormData) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'createVisa',
    { recordResponse: true },
    async () => {
      try {
        const controller = getInjection('ICreateVisaController');
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const data = Object.fromEntries(formData.entries());
        const visa = await controller(data, token);
        revalidatePath('/[locale]', 'layout');
        return { result: visa };
      } catch (err) {
        if (err instanceof InputParseError) return { error: err.message };
        if (err instanceof AuthenticationError || err instanceof UnauthenticatedError)
          return { error: err.message };
        getInjection('ICrashReporterService').report(err);
        return { error: 'An error happened. The developers have been notified. Please try again later.' };
      }
    }
  );
}

export async function updateVisa(formData: FormData) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'updateVisa',
    { recordResponse: true },
    async () => {
      try {
        const controller = getInjection('IUpdateVisaController');
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const data = Object.fromEntries(formData.entries());
        const visa = await controller(data, token);
        revalidatePath('/[locale]', 'layout');
        return { result: visa };
      } catch (err) {
        if (err instanceof InputParseError) return { error: err.message };
        if (err instanceof AuthenticationError || err instanceof UnauthenticatedError)
          return { error: err.message };
        getInjection('ICrashReporterService').report(err);
        return { error: 'An error happened. The developers have been notified. Please try again later.' };
      }
    }
  );
}

export async function deleteVisa(id: number) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'deleteVisa',
    { recordResponse: true },
    async () => {
      try {
        const controller = getInjection('IDeleteVisaController');
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        await controller({ id }, token);
        revalidatePath('/[locale]', 'layout');
        return { result: true };
      } catch (err) {
        if (err instanceof InputParseError) return { error: err.message };
        if (err instanceof AuthenticationError || err instanceof UnauthenticatedError)
          return { error: err.message };
        getInjection('ICrashReporterService').report(err);
        return { error: 'An error happened. The developers have been notified. Please try again later.' };
      }
    }
  );
}
