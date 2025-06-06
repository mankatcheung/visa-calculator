import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE } from '@/config';

import { LeaveForm } from '@/app/_components/leave-form';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/app/_components/ui/breadcrumb';
import { getInjection } from '@/di/container';
import {
  AuthenticationError,
  UnauthenticatedError,
} from '@/src/entities/errors/auth';

async function getLeave(id: number) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.startSpan(
    {
      name: 'getLeave',
      op: 'function.nextjs',
    },
    async () => {
      try {
        const getLeaveController = getInjection('IGetLeaveController');
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const leaves = await getLeaveController(id, token);
        return leaves;
      } catch (err) {
        if (
          err instanceof UnauthenticatedError ||
          err instanceof AuthenticationError
        ) {
          redirect('/sign-in');
        }
        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);

        throw err;
      }
    }
  );
}
export default async function LeaveEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations();
  const { id } = await params;
  let leave;
  try {
    leave = await getLeave(Number(id));
  } catch (err) {
    throw err;
  }
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 w-full max-w-3xl mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">{t('visaCalculator')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('editLeave')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <LeaveForm
        leave={{
          id: leave.id,
          startDate: leave.startDate,
          endDate: leave.endDate,
          color: leave.color || undefined,
          remarks: leave.remarks || undefined,
        }}
      />
    </div>
  );
}
