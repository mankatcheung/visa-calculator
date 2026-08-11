'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/app/_components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/_components/ui/dialog';
import { visaActions } from '@/app/actions';

export function VisaDeleteButton({
  id,
  country,
  name,
}: {
  id: number;
  country: string;
  name: string;
}) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    startTransition(async () => {
      const res = await visaActions.deleteVisa(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(t('success'));
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon" className="cursor-pointer">
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('deleteVisa')}</DialogTitle>
          <DialogDescription>{t('deleteReminder')}</DialogDescription>
        </DialogHeader>
        <div>{`${country} — ${name}`}</div>
        <DialogFooter>
          <form onSubmit={handleSubmit}>
            <Button variant="destructive" type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              {t('confirm')}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
