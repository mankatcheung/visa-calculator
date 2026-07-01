import { getTranslations } from 'next-intl/server';

import { VerifyEmailForm } from '@/app/_components/verify-email-form';

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function Page({ searchParams }: Props) {
  const t = await getTranslations();
  const { token } = await searchParams;
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <h1 className="sr-only">{t('verifyEmail')}</h1>
      <div className="w-full max-w-sm">
        <VerifyEmailForm token={token} />
      </div>
    </main>
  );
}
