import { Pencil } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE } from '@/config';

import { LeaveDeleteButton } from '@/app/_components/leave-delete-button';
import { Button } from '@/app/_components/ui/button';
import { Card, CardContent } from '@/app/_components/ui/card';
import { getInjection } from '@/di/container';
import { Link } from '@/i18n/navigation';
import { displayUKDateTime } from '@/lib/utils';
import {
  AuthenticationError,
  UnauthenticatedError,
} from '@/src/entities/errors/auth';

async function getLeavesForUser() {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.startSpan(
    {
      name: 'getLeavesForUser',
      op: 'function.nextjs',
    },
    async () => {
      try {
        const getLeaveForUserController = getInjection(
          'IGetLeavesForUserController'
        );
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const leaves = await getLeaveForUserController(token);
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

const getTotalLeaveDays = (leaves: { startDate: Date; endDate: Date }[]) => {
  let result = 0;
  for (let i = 0; i < leaves.length; i++) {
    const { startDate, endDate } = leaves[i];
    const t1 = startDate.getTime();
    const t2 = endDate.getTime();
    const days = Math.floor((t2 - t1) / (24 * 3600 * 1000));
    result += days + 1;
  }
  return result;
};

export default async function LeavesPage() {
  const t = await getTranslations();
  let leaves;
  try {
    leaves = await getLeavesForUser();
  } catch (err) {
    throw err;
  }

  return (
    <div
      className="w-full max-w-3xl mx-auto flex flex-1 flex-col gap-4 p-4"
      data-cy="dashboard-content"
    >
      <div className="space-y-2">
        {leaves.length === 0 && (
          <Card>
            <CardContent>
              <div className="flex flex-col justify-center items-center w-full">
                <div className="text-muted-foreground">{t('noRecords')}</div>
              </div>
            </CardContent>
          </Card>
        )}
        {leaves.map((leave) => {
          return (
            <div
              key={leave.id}
              className="flex flex-row items-center space-x-2 rounded-md border px-4 py-3 font-mono text-sm"
            >
              <div
                className={
                  'rounded-full h-6 w-6 cursor-pointer active:scale-105'
                }
                style={{
                  backgroundColor: leave.color!,
                }}
              />
              <div className="flex-1 flex flex-col gap-2">
                <div>
                  {`${displayUKDateTime(leave.startDate)} - ${displayUKDateTime(leave.endDate)}`}
                </div>
                <div>
                  {t('countDays', { count: getTotalLeaveDays([leave]) })}
                </div>
                {leave.remarks && (
                  <div className="text-xs">{leave.remarks}</div>
                )}
              </div>
              <Link href={`/leaves/${leave.id}/edit`}>
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer"
                >
                  <Pencil />
                </Button>
              </Link>
              <LeaveDeleteButton
                id={leave.id}
                startDate={leave.startDate}
                endDate={leave.endDate}
              />
            </div>
          );
        })}
      </div>
      <Link href="/leaves/create">
        <Button variant="secondary" className="w-full cursor-pointer">
          {t('addNewEntry')}
        </Button>
      </Link>
    </div>
  );
}
