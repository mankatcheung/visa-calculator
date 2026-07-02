'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/_components/ui/form';
import { Input } from '@/app/_components/ui/input';
import { userActions } from '@/app/actions';

type DeleteAccountFormProps = React.ComponentPropsWithoutRef<'div'>;

export function DeleteAccountForm({}: DeleteAccountFormProps) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();

  const FormSchema = z.object({
    currentPassword: z.string().min(1, { message: t('pleaseInput') }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      currentPassword: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (loading) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set('currentPassword', data.currentPassword);
      const res = await userActions.deleteAccount(formData);
      // On success the server action redirects to /sign-in, so there is
      // nothing further to do here -- only the error path returns.
      if (res && res.error) {
        toast.error(res.error);
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          className="cursor-pointer"
          data-cy="delete-account-trigger"
        >
          {t('deleteAccount')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('deleteAccount')}</DialogTitle>
          <DialogDescription>
            {t('deleteAccountConfirmation')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('currentPassword')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('currentPassword')}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                variant="destructive"
                type="submit"
                disabled={loading}
                data-cy="delete-account-confirm"
              >
                {loading && <Loader2 className="animate-spin" />}
                {t('confirm')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
