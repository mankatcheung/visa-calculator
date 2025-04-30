"use client";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { z } from "zod";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { SelectSingleEventHandler } from "react-day-picker";
import { createLeave, updateLeave } from "../[locale]/(private)/actions";
import { useRouter } from "@/i18n/navigation";

const HEX_CODE_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

const DateInput = ({
  value,
  onChange,
  label,
  description,
}: {
  value: Date;
  onChange: SelectSingleEventHandler;
  label: string;
  description: string;
}) => {
  const t = useTranslations();
  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] pl-3 text-left font-normal",
                !value && "text-muted-foreground",
              )}
            >
              {value ? format(value, "PPP") : <span>{t("pickADate")}</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
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
} & React.ComponentPropsWithoutRef<"div">;

export function LeaveForm({ leave }: LeaveFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const [loading, startTransition] = useTransition();

  const FormSchema = z.object({
    startDate: z.date({
      required_error: t("startDateRequiredWarning"),
    }),
    endDate: z.date({
      required_error: t("endDateRequiredWarning"),
    }),
    color: z
      .string()
      .refine(
        (value) => HEX_CODE_REGEX.test(value ?? ""),
        t("colorFormatWarning"),
      )
      .optional(),
    remarks: z.string().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: leave,
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (loading) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("startDate", data.startDate.toUTCString());
      formData.set("endDate", data.endDate.toUTCString());
      formData.set("color", data.color ?? "");
      formData.set("remarks", data.remarks ?? "");
      let res;
      if (leave) {
        formData.set("id", String(leave.id));
        res = await updateLeave(formData);
      } else {
        res = await createLeave(formData);
      }
      if (res && res.error) {
        // setError(res.error);
        console.log(res.error);
      } else {
        router.push("/");
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
              label={t("startDate")}
              description={t("startDateDescription")}
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
              label={t("endDate")}
              description={t("endDateDescription")}
            />
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("color")}</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>{t("remarks")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("remarks")}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{t("submit")}</Button>
      </form>
    </Form>
  );
}
