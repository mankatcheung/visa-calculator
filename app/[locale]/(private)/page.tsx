import { SESSION_COOKIE } from "@/config";
import { getInjection } from "@/di/container";
import {
  AuthenticationError,
  UnauthenticatedError,
} from "@/src/entities/errors/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/app/_components/ui/button";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Pencil } from "lucide-react";
import { LeaveDeleteButton } from "@/app/_components/leave-delete-button";

export async function getLeavesForUser() {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.startSpan(
    {
      name: "getLeavesForUser",
      op: "function.nextjs",
    },
    async () => {
      try {
        const getLeaveForUserController = getInjection(
          "IGetLeavesForUserController",
        );
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        const leaves = await getLeaveForUserController(token);
        return leaves;
      } catch (err) {
        if (
          err instanceof UnauthenticatedError ||
          err instanceof AuthenticationError
        ) {
          redirect("/sign-in");
        }
        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(err);

        throw err;
      }
    },
  );
}

export default async function Home() {
  const t = await getTranslations();
  let leaves;
  try {
    leaves = await getLeavesForUser();
  } catch (err) {
    throw err;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="space-y-2">
        {leaves.map((leave) => {
          return (
            <div
              key={leave.id}
              className="flex flex-row items-center space-x-2 rounded-md border px-4 py-3 font-mono text-sm"
            >
              <div className="flex-1">
                {`${leave.startDate.toDateString()} - ${leave.endDate.toDateString()}`}
              </div>
              <Link href={`/leaves/${leave.id}/edit`}>
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer"
                >
                  <Pencil />
                </Button>
              </Link>
              <LeaveDeleteButton
                id={leave.id}
                startDate={leave.startDate}
                endDate={leave.endDate}
              />
            </div>
          );
        })}
      </div>
      <Link href="/leaves/create">
        <Button variant="secondary" className="w-full cursor-pointer">
          {t("addNewEntry")}
        </Button>
      </Link>
    </div>
  );
}
