'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CircleX, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/app/_components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/_components/ui/dialog';
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
  pendingEmail: string | null;
} & React.ComponentPropsWithoutRef<'div'>;

export function UpdateEmailForm({
  email,
  pendingEmail: initialPendingEmail,
}: UpdateEmailFormProps) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(
    initialPendingEmail
  );

  useEffect(() => {
    setPendingEmail(initialPendingEmail);
  }, [initialPendingEmail]);

  const EmailSchema = z.object({
    email: z.email({ message: t('pleaseInput') }),
  });

  const OtpSchema = z.object({
    otp: z.string().length(6, { message: t('emailChangeOtpInvalid') }),
  });

  const emailForm = useForm<z.infer<typeof EmailSchema>>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email },
  });

  const otpForm = useForm<z.infer<typeof OtpSchema>>({
    resolver: zodResolver(OtpSchema),
    defaultValues: { otp: '' },
  });

  const onSubmitEmail = (data: z.infer<typeof EmailSchema>) => {
    if (loading) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set('email', data.email);
      const res = await userActions.requestEmailChange(formData);
      if (res?.error) {
        toast.error(res.error);
      } else if (res?.result) {
        setPendingEmail(res.result.pendingEmail);
        setIsEditing(false);
        emailForm.reset();
      }
    });
  };

  const onSubmitOtp = (data: z.infer<typeof OtpSchema>) => {
    if (loading) return;
    startTransition(async () => {
      const res = await userActions.verifyEmailChangeOtp(data.otp);
      if (res?.error) {
        toast.error(res.error);
        otpForm.reset();
      } else {
        toast.success(t('emailChangeOtpSuccess'));
        setPendingEmail(null);
        otpForm.reset();
      }
    });
  };

  const onCancel = () => {
    if (loading) return;
    startTransition(async () => {
      const res = await userActions.cancelEmailChange();
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      setPendingEmail(null);
      otpForm.reset();
    });
  };

  const onResend = () => {
    if (!pendingEmail || loading) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set('email', pendingEmail);
      const res = await userActions.requestEmailChange(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(t('emailChangeOtpResent'));
        otpForm.reset();
      }
    });
  };

  if (!email) {
    return <Loader2 className="animate-spin" />;
  }

  return (
    <>
      {isEditing ? (
        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(onSubmitEmail)}
            className="w-full"
          >
            <FormField
              control={emailForm.control}
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
                    <Button
                      type="submit"
                      data-cy="submit"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="animate-spin" />}
                      {t('submit')}
                    </Button>
                    <Button
                      variant="outline"
                      data-cy="cancel"
                      disabled={loading}
                      onClick={() => {
                        setIsEditing(false);
                        emailForm.reset();
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
      ) : (
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
      )}

      <Dialog open={!!pendingEmail} onOpenChange={(open) => { if (!open) onCancel(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('emailChangeOtpTitle')}</DialogTitle>
            <DialogDescription>
              {t('emailChangeOtpDescription', { email: pendingEmail ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <Form {...otpForm}>
            <form
              onSubmit={otpForm.handleSubmit(onSubmitOtp)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        data-cy="otp"
                        placeholder={t('emailChangeOtpPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={loading}
                  onClick={onResend}
                >
                  {t('emailChangeOtpResend')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={onCancel}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="animate-spin" />}
                  {t('submit')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
