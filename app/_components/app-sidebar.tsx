import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/app/_components/ui/sidebar';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ThemePicker } from './theme-picker';
import { LocalePicker } from './locale-picker';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations();
  const pathname = usePathname();
  const data = {
    navMain: [
      {
        title: t('general'),
        url: '#',
        items: [
          {
            title: t('visaCalculator'),
            url: '/',
          },
        ],
      },
      {
        title: t('user'),
        url: '#',
        items: [
          {
            title: t('settings'),
            url: '/users/settings',
          },
        ],
      },
    ],
  };
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="p-2">Visa</div>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.url === pathname}>
                      <Link href={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="flex flex-row justify-between items-center p-4">
        <LocalePicker />
        <ThemePicker />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
