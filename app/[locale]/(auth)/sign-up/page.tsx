import { getTranslations } from 'next-intl/server';

import { SignUpForm } from '@/app/_components/sign-up-form';

export default async function Page() {
  const t = await getTranslations();
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <h1 className="sr-only">{t('signUp')}</h1>
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </main>
  );
}
