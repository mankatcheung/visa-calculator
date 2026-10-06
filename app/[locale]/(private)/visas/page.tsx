import { Pencil } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { VisaDeleteButton } from '@/app/_components/visa-delete-button';
import { Badge } from '@/app/_components/ui/badge';
import { Button } from '@/app/_components/ui/button';
import { Card, CardContent } from '@/app/_components/ui/card';
import { getVisasForUser } from '@/app/actions/visas';
import { Link } from '@/i18n/navigation';
import { displayUKDateTime } from '@/lib/utils';
import { getVisaStatus } from '@/lib/visa';

export default async function VisasPage() {
  const t = await getTranslations();
  const res = await getVisasForUser();
  const visas = res.result ?? [];
  const today = new Date();

  return (
    <div
      className="w-full max-w-3xl mx-auto flex flex-1 flex-col gap-4 p-4"
      data-cy="visas-content"
    >
      <h1 className="sr-only">{t('visas')}</h1>
      <div className="space-y-2">
        {visas.length === 0 && (
          <Card>
            <CardContent className="flex justify-center items-center py-6">
              <div className="text-muted-foreground">{t('noVisas')}</div>
            </CardContent>
          </Card>
        )}
        {visas.map((visa) => {
          const { daysUntilExpiry, isExpired, isExpiringSoon } = getVisaStatus(visa, [], today);
          const badge = isExpired ? (
            <Badge variant="destructive">{t('expired')}</Badge>
          ) : isExpiringSoon ? (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {t('countDaysRemaining', { count: daysUntilExpiry })}
            </Badge>
          ) : (
            <Badge variant="default" className="bg-green-100 text-green-800">
              {t('active')}
            </Badge>
          );

          return (
            <div
              key={visa.id}
              className="flex flex-row items-center space-x-2 rounded-md border px-4 py-3 text-sm"
            >
              <div className="flex-1 flex flex-col gap-1">
                <div className="font-medium">{visa.country} — {visa.name}</div>
                <div className="text-muted-foreground">
                  {displayUKDateTime(visa.startDate, 'P')} – {displayUKDateTime(visa.expiryDate, 'P')}
                </div>
                {visa.remarks && (
                  <div className="text-xs text-muted-foreground">{visa.remarks}</div>
                )}
              </div>
              {badge}
              <Link href={`/visas/${visa.id}/edit`}>
                <Button variant="outline" size="icon" className="cursor-pointer">
                  <Pencil />
                </Button>
              </Link>
              <VisaDeleteButton id={visa.id} country={visa.country} name={visa.name} />
            </div>
          );
        })}
      </div>
      <Link href="/visas/create">
        <Button variant="secondary" className="w-full cursor-pointer">
          {t('createVisa')}
        </Button>
      </Link>
    </div>
  );
}
