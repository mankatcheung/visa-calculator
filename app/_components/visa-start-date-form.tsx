'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, CircleX, Loader2 } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/_components/ui/popover';
import { userSettingsActions } from '@/app/actions';
import { cn } from '@/lib/utils';

type VisaStartDateFormProps = {
  visaStartDate?: Date;
} & React.ComponentPropsWithoutRef<'div'>;

export function VisaStartDateForm({ visaStartDate }: VisaStartDateFormProps) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const FormSchema = z.object({
    visaStartDate: z.date({
      required_error: t('pleaseInput'),
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      visaStartDate: visaStartDate ?? undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (loading) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set('visaStartDate', data.visaStartDate.toUTCString());
      const res = await userSettingsActions.updateUserSettings(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(t('success'));
        setIsEditing(false);
      }
    });
  };
  if (!visaStartDate) {
    return <Loader2 className="animate-spin" />;
  }
  if (isEditing)
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="visaStartDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <div className="flex flex-row items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'flex-1 pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>{t('pickADate')}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
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
      <div className="flex-1">{visaStartDate.toDateString()}</div>
      <Button
        variant="outline"
        data-cy="edit-visa-start-date"
        onClick={() => setIsEditing(true)}
      >
        {t('edit')}
      </Button>
    </div>
  );
}
