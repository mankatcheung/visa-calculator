import { getTranslations } from 'next-intl/server';

import { ResetPasswordForm } from '@/app/_components/reset-password-form';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const t = await getTranslations();
  const { token } = await searchParams;
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <h1 className="sr-only">{t('resetPassword')}</h1>
      <div className="w-full max-w-sm">
        <ResetPasswordForm token={token ?? ''} />
      </div>
    </main>
  );
}
