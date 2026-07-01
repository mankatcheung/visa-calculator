'use client';

import { Label } from '@radix-ui/react-label';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/app/_components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { Input } from '@/app/_components/ui/input';
import { authActions } from '@/app/actions';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const res = await authActions.requestPasswordReset(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(t('resetLinkSent'));
      }
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('forgotPassword')}</CardTitle>
          <CardDescription>{t('forgotPasswordDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="animate-spin" />}
                {t('sendResetLink')}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              <Link href="/sign-in" className="underline underline-offset-4">
                {t('signIn')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
