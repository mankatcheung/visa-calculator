'use client';

import { format } from 'date-fns';
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
  DialogTitle,
  DialogTrigger,
} from '@/app/_components/ui/dialog';
import { DialogHeader } from '@/app/_components/ui/dialog';
import { leaveActions } from '@/app/actions';

export function LeaveDeleteButton({
  id,
  startDate,
  endDate,
}: {
  id: number;
  startDate: Date;
  endDate: Date;
}) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    startTransition(async () => {
      const res = await leaveActions.deleteLeave(id);
      if (res && res.error) {
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
          <DialogTitle>{t('deleteLeave')}</DialogTitle>
          <DialogDescription>{t('deleteReminder')}</DialogDescription>
        </DialogHeader>
        <div>{`${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}`}</div>
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
