"use client";

import { Separator } from "@radix-ui/react-separator";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "../../_components/ui/sidebar";
import { AppSidebar } from "../../_components/app-sidebar";
import { UserAvatar } from "@/app/_components/user-avatar";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-row items-center flex-1 justify-end">
            <UserAvatar />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
