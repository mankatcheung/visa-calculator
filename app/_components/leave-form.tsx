'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { GradientPicker } from '@/app/_components/color-picker';
import { DatePicker } from '@/app/_components/date-picker';
import { Button } from '@/app/_components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/_components/ui/form';
import { Textarea } from '@/app/_components/ui/textarea';
import { leaveActions } from '@/app/actions';
import { useRouter } from '@/i18n/navigation';

const DateInput = ({
  value,
  onChange,
  label,
  description,
}: {
  value: Date;
  onChange: (d: Date | undefined) => void;
  label: string;
  description: string;
}) => {
  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <DatePicker value={value} onChange={onChange} />
      </FormControl>
      <FormDescription>{description}</FormDescription>
      <FormMessage />
    </FormItem>
  );
};
type Leave = {
  id: number;
  startDate: Date;
  endDate: Date;
  color?: string;
  remarks?: string;
};

type LeaveFormProps = {
  leave?: Leave;
} & React.ComponentPropsWithoutRef<'div'>;

export function LeaveForm({ leave }: LeaveFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const [loading, startTransition] = useTransition();

  const FormSchema = z
    .object({
      startDate: z.date({
        required_error: t('startDateRequiredWarning'),
      }),
      endDate: z.date({
        required_error: t('endDateRequiredWarning'),
      }),
      color: z.string(),
      remarks: z.string().optional(),
    })
    .refine((data) => data.startDate <= data.endDate, {
      message: t('wrongDateRange'),
      path: ['endDate'], // This sets which field the error is attached to
    });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: leave ?? {
      color: '#123212',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (loading) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set('startDate', data.startDate.toUTCString());
      formData.set('endDate', data.endDate.toUTCString());
      formData.set('color', data.color ?? '');
      formData.set('remarks', data.remarks ?? '');
      let res;
      if (leave) {
        formData.set('id', String(leave.id));
        res = await leaveActions.updateLeave(formData);
      } else {
        res = await leaveActions.createLeave(formData);
      }
      if (res && res.error) {
        toast.error(res.error);
      } else {
        toast.success(t('success'));
        router.push('/');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <DateInput
              value={field.value}
              onChange={field.onChange}
              label={t('startDate')}
              description={t('startDateDescription')}
            />
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <DateInput
              value={field.value}
              onChange={field.onChange}
              label={t('endDate')}
              description={t('endDateDescription')}
            />
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('color')}</FormLabel>
              <FormControl>
                <GradientPicker
                  background={field.value}
                  setBackground={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('remarks')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('remarks')}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {t('submit')}
        </Button>
      </form>
    </Form>
  );
}
