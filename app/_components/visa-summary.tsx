import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Badge } from '@/app/_components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { Progress } from '@/app/_components/ui/progress';
import { displayUKDateTime } from '@/lib/utils';
import { getVisaStatus } from '@/lib/visa';
import type { VisaPresenterOutput } from '@/src/interface-adapters/presenters/visas/visa.presenter';

type VisaSummaryProps = {
  visa: VisaPresenterOutput;
  leaves?: { startDate: Date; endDate: Date }[];
};

export async function VisaSummary({ visa, leaves = [] }: VisaSummaryProps) {
  const t = await getTranslations();
  const today = new Date();

  const {
    daysUntilExpiry,
    isExpired,
    isExpiringSoon,
    daysSinceArrival,
    totalVisaDurationDays,
    daysUsedInWindow,
    daysRemainingInWindow,
    qualifyingProgressPct,
    qualifyingDate,
  } = getVisaStatus(visa, leaves, today);

  const statusBadge = isExpired ? (
    <Badge variant="destructive" className="flex items-center gap-1">
      <AlertTriangle className="w-3 h-3" />
      {t('expired')}
    </Badge>
  ) : isExpiringSoon ? (
    <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800">
      <Clock className="w-3 h-3" />
      {t('countDaysRemaining', { count: daysUntilExpiry })}
    </Badge>
  ) : (
    <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
      <CheckCircle className="w-3 h-3" />
      {t('active')}
    </Badge>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">
            {visa.country} — {visa.name}
          </CardTitle>
          {statusBadge}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{t('visaExpiry')}</span>
          <span className="font-medium">{displayUKDateTime(visa.expiryDate, 'P')}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{t('totalVisaDuration')}</span>
          <span className="font-medium">{t('countDays', { count: totalVisaDurationDays })}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{t('daysSinceArrival')}</span>
          <span className="font-medium">{t('countDays', { count: daysSinceArrival })}</span>
        </div>

        {daysUsedInWindow != null && daysRemainingInWindow != null && visa.maxStayDays != null && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{t('daysUsedInWindow')}</span>
              <span className="font-medium">
                {daysUsedInWindow} / {visa.maxStayDays}
              </span>
            </div>
            <Progress
              value={Math.min(100, (daysUsedInWindow / visa.maxStayDays) * 100)}
            />
          </div>
        )}

        {qualifyingProgressPct != null && qualifyingDate != null && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{t('qualifyingProgress')}</span>
              <span className="font-medium">
                {qualifyingProgressPct}% — {displayUKDateTime(qualifyingDate, 'P')}
              </span>
            </div>
            <Progress value={qualifyingProgressPct} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
