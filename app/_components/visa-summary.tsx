import { addYears, differenceInYears, subDays } from 'date-fns';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle,
  Clock,
  Plane,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Badge } from '@/app/_components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { cn, displayUKDateTime } from '@/lib/utils';
import { YEARS_TO_CITIZENSHIP, YEARS_TO_ILR } from '@/lib/visa';

type VisaSummaryProps = {
  visaStartDate: Date;
  visaExpiryDate: Date;
  arrivalDate: Date;
  totalLeaveCount: number;
  totalLeaveCountWithin: number;
};

export async function VisaSummary({
  visaStartDate,
  visaExpiryDate,
  arrivalDate,
  totalLeaveCount,
  totalLeaveCountWithin,
}: VisaSummaryProps) {
  const t = await getTranslations();
  const today = new Date();

  // Calculate durations and progress
  const totalVisaDuration = visaExpiryDate.getTime() - visaStartDate.getTime();

  const shouldExtendVisa = differenceInYears(visaExpiryDate, arrivalDate) < 5;

  const applyILRDate = addYears(arrivalDate, YEARS_TO_ILR);
  const applyCitizenship = addYears(applyILRDate, YEARS_TO_CITIZENSHIP);
  const daysStayed =
    (today.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24);
  const progressPercentage = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        (daysStayed / ((YEARS_TO_ILR + YEARS_TO_CITIZENSHIP) * 365)) * 100
      )
    )
  );

  const daysUntilExpiry = Math.ceil(
    (visaExpiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const arrivalUntilExpiry = Math.ceil(
    (visaExpiryDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const visaExpiryPercentage = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        (arrivalUntilExpiry / ((YEARS_TO_ILR + YEARS_TO_CITIZENSHIP) * 365)) *
          100
      )
    )
  );
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;
  const ilrPercentage = Math.round(
    (YEARS_TO_ILR / (YEARS_TO_ILR + YEARS_TO_CITIZENSHIP)) * 100
  );

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {t('expired')}
        </Badge>
      );
    }
    if (isExpiringSoon) {
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 bg-orange-100 text-orange-800"
        >
          <Clock className="w-3 h-3" />
          {t('expiresInCountDays', { count: daysUntilExpiry })}
        </Badge>
      );
    }
    return (
      <Badge
        variant="default"
        className="flex items-center gap-1 bg-green-100 text-green-800"
      >
        <CheckCircle className="w-3 h-3" />
        {t('active')}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              {t('timeline')}
            </CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {/* Timeline Container */}
          <div className="relative h-52">
            <div className="absolute top-0 left-0 right-0 flex justify-between text-sm text-muted-foreground mb-2">
              <div>
                <span>{t('arrival')}</span>
                <div>{displayUKDateTime(arrivalDate, 'P')}</div>
                <div className="w-[1px] h-24 bg-muted-foreground" />
              </div>
              <div className="flex flex-col items-end">
                <span>{t('citizenship')}</span>
                <div>{displayUKDateTime(applyCitizenship, 'P')}</div>
                <div className="w-[1px] h-24 bg-muted-foreground" />
              </div>
            </div>
            {visaExpiryPercentage < 100 && (
              <div
                className="absolute transform -translate-x-1/2"
                style={{ left: `${visaExpiryPercentage}%` }}
              >
                <div className="absolute top-16 left-1/2 flex flex-col items-center transform -translate-x-1/2 whitespace-nowrap text-sm text-muted-foreground">
                  <span>{t('visaExpiry')}</span>
                  <div>{displayUKDateTime(visaExpiryDate, 'P')}</div>
                  <div className="w-[1px] h-8 bg-muted-foreground" />
                </div>
              </div>
            )}
            {/* Timeline Bar */}
            <div className="absolute top-34 left-0 right-0 h-2 bg-gray-200 rounded-full transform -translate-y-1/2">
              {/* Progress Bar */}
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }} // Adjust based on current progress
              />
            </div>
            <div
              className="absolute transform -translate-x-1/2"
              style={{ left: `${ilrPercentage}%` }}
            >
              <div className="absolute top-35 left-1/2 flex flex-col items-center transform -translate-x-1/2 whitespace-nowrap text-sm text-muted-foreground">
                <div className="w-[1px] h-8 bg-muted-foreground" />
                <span>{t('ilr')}</span>
                <div>{displayUKDateTime(applyILRDate, 'P')}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {t('visaStartDate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 mb-1">
              {displayUKDateTime(visaStartDate)}
            </div>
            <p className="text-xs text-green-600">
              {today >= visaStartDate ? t('activeSince') : t('becomesActive')}
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Plane className="w-4 h-4" />
              {t('arrival')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 mb-1">
              {displayUKDateTime(arrivalDate)}
            </div>
            <p className="text-xs text-blue-600">
              {today >= arrivalDate ? t('arrived') : t('plannedArrival')}
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            isExpired
              ? 'border-red-200 bg-red-50'
              : isExpiringSoon
                ? 'border-orange-200 bg-orange-50'
                : undefined
          )}
        >
          <CardHeader className="pb-3">
            <CardTitle
              className={cn(
                'text-sm font-medium flex items-center gap-2',
                isExpired
                  ? 'text-red-700'
                  : isExpiringSoon
                    ? 'text-orange-700'
                    : undefined
              )}
            >
              <AlertTriangle className="w-4 h-4" />
              {t('visaExpiry')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold mb-1',
                isExpired
                  ? 'text-red-800'
                  : isExpiringSoon
                    ? 'text-orange-800'
                    : undefined
              )}
            >
              {displayUKDateTime(visaExpiryDate)}
            </div>
            <p
              className={cn(
                'text-xs',
                isExpired
                  ? 'text-red-600'
                  : isExpiringSoon
                    ? 'text-orange-600'
                    : undefined
              )}
            >
              {isExpired
                ? t('expired')
                : t('countDaysRemaining', { count: daysUntilExpiry })}
            </p>

            {shouldExtendVisa && (
              <p className="text-xs text-muted-foreground">
                {t('extendVisaOnDate', {
                  date: displayUKDateTime(subDays(visaExpiryDate, 28)),
                })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('visaSummary')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {t('totalVisaDuration')}
            </span>
            <span className="font-medium">
              {t('countDays', {
                count: Math.ceil(totalVisaDuration / (1000 * 60 * 60 * 24)),
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {t('daysSinceArrival')}
            </span>
            <span className="font-medium">
              {t('countDays', {
                count: Math.max(
                  0,
                  Math.ceil(
                    (today.getTime() - arrivalDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                ),
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {t('totalLeaves')}
            </span>
            <span className="font-medium">
              {t('countDays', { count: totalLeaveCount })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {t('leavesWithinCount', { count: 365 })}
            </span>
            <span className="font-medium">
              {t('countDays', { count: totalLeaveCountWithin })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('status')}</span>
            {getStatusBadge()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
