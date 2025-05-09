'use client';

import { Button } from './ui/button';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from './ui/form';
import { userActions } from '@/app/actions';
import { Input } from './ui/input';
import { toast } from 'sonner';

const DataInput = ({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (s: string) => void;
  label: string;
}) => {
  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input
          type="password"
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

type ChangePasswordFormProps = React.ComponentPropsWithoutRef<'div'>;

export function ChangePasswordForm({}: ChangePasswordFormProps) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();

  const FormSchema = z
    .object({
      currentPassword: z.string({
        required_error: t('pleaseInput'),
      }),
      newPassword: z.string({
        required_error: t('pleaseInput'),
      }),
      confirmPassword: z.string({
        required_error: t('pleaseInput'),
      }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('passwordNotMatched'),
      path: ['confirmPassword'], // This sets which field the error is attached to
    });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (loading) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set('currentPassword', data.currentPassword);
      formData.set('newPassword', data.newPassword);
      formData.set('confirmPassword', data.confirmPassword);
      const res = await userActions.changePassword(formData);
      if (res && res.error) {
        toast.error(res.error);
      } else {
        toast.success(t('success'));
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <DataInput
              value={field.value}
              onChange={field.onChange}
              label={t('currentPassword')}
            />
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <DataInput
              value={field.value}
              onChange={field.onChange}
              label={t('newPassword')}
            />
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <DataInput
              value={field.value}
              onChange={field.onChange}
              label={t('confirmPassword')}
            />
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
