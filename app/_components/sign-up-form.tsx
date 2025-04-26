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
import { useTransition } from "react";
import { signUp } from "../[locale]/(auth)/actions";
import { Separator } from "./ui/separator";

export function SignUpForm({
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
      const res = await signUp(formData);
      // if (res && res.error) {
      //   setError(res.error);
      // }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("signUp")}</CardTitle>
          <CardDescription>{t("signUpDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t("password")}</Label>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="confirmPassword">
                    {t("confirmPassword")}
                  </Label>
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {t("signUp")}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t("alreadyHaveAnAccount")}
              <Link href="/sign-in" className="underline underline-offset-4">
                {t("signIn")}
              </Link>
            </div>
            <div className="mt-4 w-full flex flex-row justify-center space-x-2 text-sm">
              <Link
                href="/sign-up"
                locale="en"
                className="underline underline-offset-4"
              >
                En
              </Link>
              <Separator orientation="vertical" />
              <Link
                href="/sign-up"
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
