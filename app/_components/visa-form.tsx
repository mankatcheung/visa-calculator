'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
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
  FormLabel,
  FormMessage,
} from '@/app/_components/ui/form';
import { Input } from '@/app/_components/ui/input';
import { Textarea } from '@/app/_components/ui/textarea';
import { visaActions } from '@/app/actions';
import { useRouter } from '@/i18n/navigation';

const FormSchema = z
  .object({
    country: z.string().min(1, 'Required'),
    name: z.string().min(1, 'Required'),
    startDate: z.date({ message: 'Required' }),
    expiryDate: z.date({ message: 'Required' }),
    arrivalDate: z.date({ message: 'Required' }),
    maxStayDays: z.string().optional(),
    rollingWindowDays: z.string().optional(),
    qualifyingPeriodYears: z.string().optional(),
    remarks: z.string().optional(),
  })
  .refine((d) => d.startDate <= d.expiryDate, {
    message: 'Expiry must be after start date',
    path: ['expiryDate'],
  });

type VisaFormData = {
  id?: number;
  country?: string;
  name?: string;
  startDate?: Date;
  expiryDate?: Date;
  arrivalDate?: Date;
  maxStayDays?: number | null;
  rollingWindowDays?: number | null;
  qualifyingPeriodYears?: number | null;
  remarks?: string | null;
};

type VisaFormProps = {
  visa?: VisaFormData;
};

export function VisaForm({ visa }: VisaFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const [loading, startTransition] = useTransition();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      country: visa?.country ?? '',
      name: visa?.name ?? '',
      startDate: visa?.startDate,
      expiryDate: visa?.expiryDate,
      arrivalDate: visa?.arrivalDate,
      maxStayDays: visa?.maxStayDays != null ? String(visa.maxStayDays) : '',
      rollingWindowDays: visa?.rollingWindowDays != null ? String(visa.rollingWindowDays) : '',
      qualifyingPeriodYears: visa?.qualifyingPeriodYears != null ? String(visa.qualifyingPeriodYears) : '',
      remarks: visa?.remarks ?? '',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (loading) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set('country', data.country);
      formData.set('name', data.name);
      formData.set('startDate', data.startDate.toUTCString());
      formData.set('expiryDate', data.expiryDate.toUTCString());
      formData.set('arrivalDate', data.arrivalDate.toUTCString());
      if (data.maxStayDays) formData.set('maxStayDays', data.maxStayDays);
      if (data.rollingWindowDays) formData.set('rollingWindowDays', data.rollingWindowDays);
      if (data.qualifyingPeriodYears) formData.set('qualifyingPeriodYears', data.qualifyingPeriodYears);
      if (data.remarks) formData.set('remarks', data.remarks);

      let res;
      if (visa?.id) {
        formData.set('id', String(visa.id));
        res = await visaActions.updateVisa(formData);
      } else {
        res = await visaActions.createVisa(formData);
      }

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(t('success'));
        router.push('/visas');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('country')}</FormLabel>
              <FormControl>
                <Input placeholder="e.g. United Kingdom" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('visaName')}</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Skilled Worker" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('visaStartDate')}</FormLabel>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('visaExpiryDate')}</FormLabel>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="arrivalDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('arrivalDate')}</FormLabel>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maxStayDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('maxStayDays')}</FormLabel>
              <FormControl>
                <Input type="number" min="1" placeholder="e.g. 90" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rollingWindowDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('rollingWindowDays')}</FormLabel>
              <FormControl>
                <Input type="number" min="1" placeholder="e.g. 180" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="qualifyingPeriodYears"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('qualifyingPeriodYears')}</FormLabel>
              <FormControl>
                <Input type="number" min="1" placeholder="e.g. 5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('remarks')}</FormLabel>
              <FormControl>
                <Textarea className="resize-none" {...field} />
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
