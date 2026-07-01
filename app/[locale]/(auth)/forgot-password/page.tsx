import { getTranslations } from 'next-intl/server';

import { ForgotPasswordForm } from '@/app/_components/forgot-password-form';

export default async function Page() {
  const t = await getTranslations();
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <h1 className="sr-only">{t('forgotPassword')}</h1>
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
