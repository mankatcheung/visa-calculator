'use client';

import { Download, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/app/_components/ui/button';
import { userActions } from '@/app/actions';

type DataExportButtonProps = React.ComponentPropsWithoutRef<'div'>;

export function DataExportButton({}: DataExportButtonProps) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();

  const handleClick = () => {
    if (loading) return;
    startTransition(async () => {
      const res = await userActions.getDataExport();
      if (!res || res.error || !res.result) {
        toast.error(res?.error ?? t('downloadMyDataError'));
        return;
      }

      // The export is delivered as JSON via the server action, then turned
      // into a downloadable file client-side (rather than a dedicated API
      // route) to stay consistent with how every other authenticated
      // user-data operation in this app goes through a server action.
      const blob = new Blob([JSON.stringify(res.result, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'my-data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="cursor-pointer"
      onClick={handleClick}
      disabled={loading}
      data-cy="data-export-trigger"
    >
      {loading ? <Loader2 className="animate-spin" /> : <Download />}
      {t('downloadMyData')}
    </Button>
  );
}
