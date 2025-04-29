"use client";

import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-label";
import { Button } from "./ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Input } from "./ui/input";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Separator } from "./ui/separator";
import { useTransition } from "react";
import { signIn } from "../[locale]/(auth)/actions";

export function SignInForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const res = await signIn(formData);
      if (res && res.error) {
        // setError(res.error);
        console.log(res.error);
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("signIn")}</CardTitle>
          <CardDescription>{t("signInDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t("password")}</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    {t("forgotPassword")}
                  </a>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                {t("signIn")}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t("dontHaveAnAccount")}{" "}
              <Link href="/sign-up" className="underline underline-offset-4">
                {t("signUp")}
              </Link>
            </div>
            <div className="mt-4 w-full flex flex-row justify-center space-x-2 text-sm">
              <Link
                href="/sign-in"
                locale="en"
                className="underline underline-offset-4"
              >
                En
              </Link>
              <Separator orientation="vertical" />
              <Link
                href="/sign-in"
                locale="zh-Hant-HK"
                className="underline underline-offset-4"
              >
                繁
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
