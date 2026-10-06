import { getTranslations } from 'next-intl/server';

import { ChangePasswordForm } from '@/app/_components/change-password-form';
import { DataExportButton } from '@/app/_components/data-export-button';
import { DeleteAccountForm } from '@/app/_components/delete-account-form';
import { Separator } from '@/app/_components/ui/separator';
import { UpdateEmailForm } from '@/app/_components/update-email-form';
import { getPendingEmailChange, getSelfUser } from '@/app/actions/users';

export default async function UserSettingsPage() {
  const t = await getTranslations();
  const res = await getSelfUser();
  const user = res.result;
  const pendingEmailRes = await getPendingEmailChange();
  return (
    <div
      className="w-full max-w-3xl mx-auto flex flex-col items-stretch gap-8 p-4"
      data-cy="user-settings-content"
    >
      <h1 className="sr-only">{t('settings')}</h1>
      <div className="text-lg font-bold">{t('updateEmail')}</div>
      <UpdateEmailForm
        email={user?.email}
        pendingEmail={pendingEmailRes.result ?? null}
      />
      <Separator />
      <div className="text-lg font-bold">{t('changePassword')}</div>
      <ChangePasswordForm />
      <Separator />
      <div className="text-lg font-bold">{t('yourData')}</div>
      <p className="text-sm text-muted-foreground">
        {t('downloadMyDataDescription')}
      </p>
      <DataExportButton />
      <Separator />
      <div className="text-lg font-bold text-destructive">
        {t('dangerZone')}
      </div>
      <p className="text-sm text-muted-foreground">
        {t('deleteAccountDescription')}
      </p>
      <DeleteAccountForm />
    </div>
  );
}
