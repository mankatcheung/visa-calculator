import { getTranslations } from 'next-intl/server';

import { ChangePasswordForm } from '@/app/_components/change-password-form';
import { Separator } from '@/app/_components/ui/separator';
import { UpdateEmailForm } from '@/app/_components/update-email-form';
import { getSelfUser } from '@/app/actions/users';

export default async function UserSettingsPage() {
  const t = await getTranslations();
  const res = await getSelfUser();
  const user = res.result;
  return (
    <div className="flex flex-col items-stretch gap-4 p-4">
      <div className="text-lg font-bold">{t('updateEmail')}</div>
      <UpdateEmailForm email={user?.email} />
      <Separator />
      <div className="text-lg font-bold">{t('changePassword')}</div>
      <ChangePasswordForm />
    </div>
  );
}
