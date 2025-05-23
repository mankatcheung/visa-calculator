import { BadgeCheck, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/_components/ui/dropdown-menu';
import { authActions } from '@/app/actions';
import useUser from '@/hooks/use-user';
import { Link } from '@/i18n/navigation';

export function UserAvatar() {
  const t = useTranslations();
  const user = useUser();

  const onSignOut = async () => {
    await authActions.signOut();
  };

  const avatar = (
    <div className="h-8 w-8 rounded-full border-white border-1 text-center cursor-pointer">
      {user?.email?.substring(0, 1).toUpperCase()}
    </div>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{avatar}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={'bottom'}
        align="start"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <Link href="/users/settings">
            <DropdownMenuItem>
              <BadgeCheck />
              {t('settings')}
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut />
          {t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
