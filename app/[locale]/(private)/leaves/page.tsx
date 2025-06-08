import { Pencil } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { LeaveDeleteButton } from '@/app/_components/leave-delete-button';
import { Button } from '@/app/_components/ui/button';
import { Card, CardContent } from '@/app/_components/ui/card';
import { getLeavesForUser } from '@/app/actions/leaves';
import { Link } from '@/i18n/navigation';
import { getTotalLeaveDays } from '@/lib/leave';
import { displayUKDateTime } from '@/lib/utils';

export default async function LeavesPage() {
  const t = await getTranslations();
  let leaves;
  try {
    const res = await getLeavesForUser();
    leaves = res.result;
  } catch (err) {
    throw err;
  }

  return (
    <div
      className="w-full max-w-3xl mx-auto flex flex-1 flex-col gap-4 p-4"
      data-cy="dashboard-content"
    >
      <div className="space-y-2">
        {leaves!.length === 0 && (
          <Card>
            <CardContent>
              <div className="flex flex-col justify-center items-center w-full">
                <div className="text-muted-foreground">{t('noRecords')}</div>
              </div>
            </CardContent>
          </Card>
        )}
        {leaves!.map((leave) => {
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
