import { Pencil } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE } from '@/config';

import { LeaveDeleteButton } from '@/app/_components/leave-delete-button';
import { Button } from '@/app/_components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { getInjection } from '@/di/container';
import { Link } from '@/i18n/navigation';
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

const getLeaveDaysSince = (
  leaves: { startDate: Date; endDate: Date }[],
  beforeDays: number
) => {
  const upperLimitDate = new Date();
  upperLimitDate.setDate(upperLimitDate.getDate() - beforeDays);
  let result = 0;
  for (let i = 0; i < leaves.length; i++) {
    const { startDate, endDate } = leaves[i];
    if (endDate < upperLimitDate) continue;
    if (upperLimitDate < startDate) {
      result += getTotalLeaveDays([leaves[i]]);
      continue;
    }
    result += getTotalLeaveDays([
      {
        startDate: upperLimitDate,
        endDate: leaves[i].endDate,
      },
    ]);
  }
  return result;
};

export default async function Home() {
  const t = await getTranslations();
  let leaves;
  try {
    leaves = await getLeavesForUser();
  } catch (err) {
    throw err;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="relative">
            <CardDescription>{t('totalLeaves')}</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {getTotalLeaveDays(leaves)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="relative">
            <CardDescription>
              {t('leavesWithinCount', { count: 365 })}
            </CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {getLeaveDaysSince(leaves, 365)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <div className="space-y-2">
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
                  {`${leave.startDate.toDateString()} - ${leave.endDate.toDateString()}`}
                </div>
                <div>{getTotalLeaveDays([leave])} day(s)</div>
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
