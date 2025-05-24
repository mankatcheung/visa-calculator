import { useTranslations } from 'next-intl';
import * as React from 'react';

import { LocalePicker } from '@/app/_components/locale-picker';
import { ThemePicker } from '@/app/_components/theme-picker';
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
            key: 'visaCalculator',
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
            key: 'users-settings',
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
                      <Link
                        data-cy={`side-bar-item-${item.key}`}
                        href={item.url}
                      >
                        {item.title}
                      </Link>
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
