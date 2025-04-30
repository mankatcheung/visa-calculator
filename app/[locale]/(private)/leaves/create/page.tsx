import { LeaveForm } from "@/app/_components/leave-form";
import { getTranslations } from "next-intl/server";

export default async function LeaveCreatePage() {
  const t = await getTranslations();
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div>{t("createLeave")}</div>
      <LeaveForm />
    </div>
  );
}
