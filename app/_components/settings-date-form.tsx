'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CircleX, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { DatePicker } from '@/app/_components/date-picker';
import { Button } from '@/app/_components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/app/_components/ui/form';
import { userSettingsActions } from '@/app/actions';

type SettingsDateFormProps = {
  dataKey: string;
  dateValue?: Date;
} & React.ComponentPropsWithoutRef<'div'>;

export function SettingsDateForm({
  dataKey,
  dateValue,
}: SettingsDateFormProps) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const FormSchema = z.object({
    date: z.date({
      message: t('pleaseInput'),
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: dateValue ?? undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (loading) return;
    startTransition(async () => {
      const formData = new FormData();
      console.log(dataKey);
      formData.set(dataKey, data.date.toUTCString());
      const res = await userSettingsActions.updateUserSettings(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(t('success'));
        setIsEditing(false);
      }
    });
  };
  if (!dateValue) {
    return <Loader2 className="animate-spin" />;
  }
  if (isEditing)
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <div className="flex flex-row items-center gap-2">
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <Button type="submit" data-cy="submit" disabled={loading}>
                    {loading && <Loader2 className="animate-spin" />}
                    {t('submit')}
                  </Button>
                  <Button
                    variant="outline"
                    data-cy="cancel"
                    disabled={loading}
                    onClick={() => {
                      setIsEditing(false);
                      form.reset();
                    }}
                  >
                    <CircleX />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    );

  return (
    <div className="flex flex-row items-center gap-2">
      <div className="flex-1">{format(dateValue, 'PPP')}</div>
      <Button
        variant="outline"
        data-cy={`edit-${dataKey}`}
        onClick={() => setIsEditing(true)}
      >
        {t('edit')}
      </Button>
    </div>
  );
}
