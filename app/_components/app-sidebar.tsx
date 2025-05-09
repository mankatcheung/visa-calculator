import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
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
      <SidebarRail />
    </Sidebar>
  );
}
