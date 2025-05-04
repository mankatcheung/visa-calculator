"use client";

import { Button } from "./ui/button";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Loader2, CircleX } from "lucide-react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormControl, FormMessage } from "./ui/form";
import { userActions } from "@/app/actions";
import { Input } from "./ui/input";
import { toast } from "sonner";

type UpdateEmailFormProps = {
  email: string;
} & React.ComponentPropsWithoutRef<"div">;

export function UpdateEmailForm({ email }: UpdateEmailFormProps) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const FormSchema = z.object({
    email: z
      .string({
        required_error: t("pleaseInput"),
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
      formData.set("email", data.email);
      const res = await userActions.updateEmail(formData);
      if (res && res.error) {
        toast.error(res.error);
      } else {
        toast.success(t("success"));
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
                      placeholder={t("email")}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="animate-spin" />}
                    {t("submit")}
                  </Button>
                  <Button
                    variant="outline"
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
      <Button variant="outline" onClick={() => setIsEditing(true)}>
        {t("edit")}
      </Button>
    </div>
  );
}
