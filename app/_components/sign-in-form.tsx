'use client';

import { Label } from '@radix-ui/react-label';
import { useLocale, useTranslations } from 'next-intl';
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
import { Separator } from '@/app/_components/ui/separator';
import { authActions } from '@/app/actions';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export function SignInForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const t = useTranslations();
  const locale = useLocale();
  const [loading, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const res = await authActions.signIn(formData, `/${locale}`);
      if (res && res.error) {
        toast.error(res.error);
      } else {
        toast.success(t('success'));
      }
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('signIn')}</CardTitle>
          <CardDescription>{t('signInDescription')}</CardDescription>
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
                  data-cy="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t('password')}</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    {t('forgotPassword')}
                  </a>
                </div>
                <Input
                  data-cy="password"
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>
              <Button type="submit" data-cy="submit" className="w-full">
                {t('signIn')}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t('dontHaveAnAccount')}{' '}
              <Link
                href="/sign-up"
                data-cy="sign-up"
                className="underline underline-offset-4"
              >
                {t('signUp')}
              </Link>
            </div>
            <div className="mt-4 w-full flex flex-row justify-center space-x-2 text-sm">
              <Link
                href="/sign-in"
                locale="en"
                data-cy="locale-en"
                className="underline underline-offset-4"
              >
                En
              </Link>
              <Separator orientation="vertical" />
              <Link
                href="/sign-in"
                locale="zh-Hant-HK"
                data-cy="locale-zh-Hant-HK"
                className="underline underline-offset-4"
              >
                繁
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
