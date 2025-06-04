import { getTranslations } from 'next-intl/server';

import { ChangePasswordForm } from '@/app/_components/change-password-form';
import { Separator } from '@/app/_components/ui/separator';
import { UpdateEmailForm } from '@/app/_components/update-email-form';
import { VisaStartDateForm } from '@/app/_components/visa-start-date-form';
import { getUserSettingsForUser } from '@/app/actions/user-settings';
import { getSelfUser } from '@/app/actions/users';

export default async function UserSettingsPage() {
  const t = await getTranslations();
  const res = await getSelfUser();
  const user = res.result;
  const settingsRes = await getUserSettingsForUser();
  const settings = settingsRes.result;
  return (
    <div
      className="flex flex-col items-stretch gap-4 p-4"
      data-cy="user-settings-content"
    >
      <div className="text-lg font-bold">{t('visaStartDate')}</div>
      <VisaStartDateForm visaStartDate={settings?.visaStartDate} />
      <div className="text-lg font-bold">{t('updateEmail')}</div>
      <UpdateEmailForm email={user?.email} />
      <Separator />
      <div className="text-lg font-bold">{t('changePassword')}</div>
      <ChangePasswordForm />
    </div>
  );
}
