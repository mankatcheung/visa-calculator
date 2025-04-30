"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/_components/ui/dialog";
import { DialogHeader } from "./ui/dialog";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { deleteLeave } from "../[locale]/(private)/actions";

export function LeaveDeleteButton({
  id,
  startDate,
  endDate,
}: {
  id: number;
  startDate: Date;
  endDate: Date;
}) {
  const t = useTranslations();
  const [loading, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    startTransition(async () => {
      const res = await deleteLeave(id);
      if (res && res.error) {
        // setError(res.error);
        console.log(res.error);
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon" className="cursor-pointer">
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("deleteLeave")}</DialogTitle>
          <DialogDescription>{t("deleteReminder")}</DialogDescription>
        </DialogHeader>
        <div>{`${startDate.toDateString()} - ${endDate.toDateString()}`}</div>
        <DialogFooter>
          <form onSubmit={handleSubmit}>
            <Button variant="destructive" type="submit">
              {t("confirm")}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
