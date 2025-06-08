import { getTranslations } from 'next-intl/server';

import { Button } from '@/app/_components/ui/button';
import { VisaSummary } from '@/app/_components/visa-summary';
import { getLeavesForUser } from '@/app/actions/leaves';
import { getUserSettingsForUser } from '@/app/actions/user-settings';
import { Link } from '@/i18n/navigation';
import { getLeaveDaysSince, getTotalLeaveDays } from '@/lib/leave';

export default async function Home() {
  const t = await getTranslations();

  let visaStartDate = new Date();
  let visaExpiryDate = new Date();
  let arrivalDate = new Date();
  let leaves;
  try {
    const settingsRes = await getUserSettingsForUser();
    const leavesRes = await getLeavesForUser();
    visaStartDate = settingsRes.result?.visaStartDate ?? new Date();
    visaExpiryDate = settingsRes.result?.visaExpiryDate ?? new Date();
    arrivalDate = settingsRes.result?.arrivalDate ?? new Date();
    leaves = leavesRes.result;
  } catch (err) {
    throw err;
  }
  const totalLeaveCount = getTotalLeaveDays(leaves || []);
  const totalLeaveCountWithin = getLeaveDaysSince(leaves || [], 365);
  return (
    <div
      className="w-full max-w-3xl mx-auto flex flex-1 flex-col gap-4 p-4"
      data-cy="dashboard-content"
    >
      <VisaSummary
        visaStartDate={visaStartDate}
        visaExpiryDate={visaExpiryDate}
        arrivalDate={arrivalDate}
        totalLeaveCount={totalLeaveCount}
        totalLeaveCountWithin={totalLeaveCountWithin}
      />
      <Link href="/leaves">
        <Button variant="secondary" className="w-full cursor-pointer">
          {t('leavesRecords')}
        </Button>
      </Link>
    </div>
  );
}
