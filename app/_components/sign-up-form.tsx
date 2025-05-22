'use client';

import { Label } from '@radix-ui/react-label';
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
import { Separator } from '@/app/_components/ui/separator';
import { authActions } from '@/app/actions';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export function SignUpForm({
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
      const res = await authActions.signUp(formData);
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
          <CardTitle className="text-2xl">{t('signUp')}</CardTitle>
          <CardDescription>{t('signUpDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  name="email"
                  type="email"
                  data-cy="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t('password')}</Label>
                </div>
                <Input
                  name="password"
                  type="password"
                  data-cy="password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="confirmPassword">
                    {t('confirmPassword')}
                  </Label>
                </div>
                <Input
                  name="confirmPassword"
                  type="password"
                  data-cy="confirmPassword"
                  required
                />
              </div>
              <Button type="submit" data-cy="submit" className="w-full">
                {t('signUp')}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t('alreadyHaveAnAccount')}
              <Link
                href="/sign-in"
                data-cy="sign-in"
                className="underline underline-offset-4"
              >
                {t('signIn')}
              </Link>
            </div>
            <div className="mt-4 w-full flex flex-row justify-center space-x-2 text-sm">
              <Link
                href="/sign-up"
                locale="en"
                data-cy="locale-en"
                className="underline underline-offset-4"
              >
                En
              </Link>
              <Separator orientation="vertical" />
              <Link
                href="/sign-up"
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
