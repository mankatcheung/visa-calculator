'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CircleX, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/app/_components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/app/_components/ui/form';
import { Input } from '@/app/_components/ui/input';
import { userActions } from '@/app/actions';

type UpdateEmailFormProps = {
  email?: string;
} & React.ComponentPropsWithoutRef<'div'>;

export function UpdateEmailForm({ email }: UpdateEmailFormProps) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const FormSchema = z.object({
    email: z
      .string({
        required_error: t('pleaseInput'),
      })
      .email(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (loading) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set('email', data.email);
      const res = await userActions.updateEmail(formData);
      if (res && res.error) {
        toast.error(res.error);
      } else {
        toast.success(t('success'));
        setIsEditing(false);
      }
    });
  };
  if (!email) {
    return <Loader2 className="animate-spin" />;
  }
  if (isEditing)
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <div className="flex flex-row items-center gap-2">
                  <FormControl className="flex-1">
                    <Input
                      type="email"
                      data-cy="email"
                      placeholder={t('email')}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
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
      <div className="flex-1">{email}</div>
      <Button
        variant="outline"
        data-cy="edit-email"
        onClick={() => setIsEditing(true)}
      >
        {t('edit')}
      </Button>
    </div>
  );
}
