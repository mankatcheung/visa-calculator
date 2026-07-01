'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/app/_components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { authActions } from '@/app/actions';
import { cn } from '@/lib/utils';

interface Props extends React.ComponentPropsWithoutRef<'div'> {
  token?: string;
}

export function VerifyEmailForm({ className, token, ...props }: Props) {
  const t = useTranslations();
  const [verifying, startVerifying] = useTransition();
  const [resending, startResending] = useTransition();

  useEffect(() => {
    if (!token) return;
    startVerifying(async () => {
      const res = await authActions.verifyEmail(token);
      if (res?.error) {
        toast.error(res.error);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResend = () => {
    if (resending) return;
    startResending(async () => {
      const res = await authActions.resendVerificationEmail();
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(t('verifyEmailResendSuccess'));
      }
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('verifyEmail')}</CardTitle>
          <CardDescription>{t('verifyEmailDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {verifying && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="animate-spin" size={16} />
                <span>{t('verifyEmail')}…</span>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resending || verifying}
            >
              {resending && <Loader2 className="animate-spin" />}
              {t('verifyEmailResend')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
