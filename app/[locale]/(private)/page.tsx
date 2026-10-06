import { getTranslations } from 'next-intl/server';

import { Button } from '@/app/_components/ui/button';
import { VisaSummary } from '@/app/_components/visa-summary';
import { getLeavesForUser } from '@/app/actions/leaves';
import { getVisasForUser } from '@/app/actions/visas';
import { Link } from '@/i18n/navigation';

export default async function Home() {
  const t = await getTranslations();

  const [visasRes, leavesRes] = await Promise.all([
    getVisasForUser(),
    getLeavesForUser(),
  ]);

  const visas = visasRes.result ?? [];
  const leaves = leavesRes.result ?? [];

  return (
    <div
      className="w-full max-w-3xl mx-auto flex flex-1 flex-col gap-4 p-4"
      data-cy="dashboard-content"
    >
      <h1 className="sr-only">{t('summary')}</h1>

      {visas.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">{t('noVisas')}</div>
      ) : (
        <div className="flex flex-col gap-4">
          {visas.map((visa) => (
            <VisaSummary key={visa.id} visa={visa} leaves={leaves} />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Link href="/visas" className="flex-1">
          <Button variant="secondary" className="w-full cursor-pointer">
            {t('visas')}
          </Button>
        </Link>
        <Link href="/leaves" className="flex-1">
          <Button variant="secondary" className="w-full cursor-pointer">
            {t('leavesRecords')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
