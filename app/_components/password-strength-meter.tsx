'use client';

import { useTranslations } from 'next-intl';

import {
  PASSWORD_STRENGTH_LABEL_KEYS,
  PasswordStrengthScore,
  getPasswordStrengthScore,
} from '@/lib/password-strength';
import { cn } from '@/lib/utils';

const SEGMENT_COUNT = 5;

const SCORE_COLOR_CLASSNAMES: Record<PasswordStrengthScore, string> = {
  0: 'bg-destructive',
  1: 'bg-destructive',
  2: 'bg-yellow-500',
  3: 'bg-blue-500',
  4: 'bg-green-600',
};

type PasswordStrengthMeterProps = {
  password: string;
} & React.ComponentPropsWithoutRef<'div'>;

export function PasswordStrengthMeter({
  password,
  className,
  ...props
}: PasswordStrengthMeterProps) {
  const t = useTranslations();

  if (!password) {
    return null;
  }

  const score = getPasswordStrengthScore(password);
  const litSegments = score + 1;

  return (
    <div
      className={cn('flex flex-col gap-1', className)}
      data-cy="password-strength-meter"
      {...props}
    >
      <div className="flex gap-1">
        {Array.from({ length: SEGMENT_COUNT }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              index < litSegments
                ? SCORE_COLOR_CLASSNAMES[score]
                : 'bg-primary/20'
            )}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {`${t('passwordStrength')}: ${t(PASSWORD_STRENGTH_LABEL_KEYS[score])}`}
      </p>
    </div>
  );
}
