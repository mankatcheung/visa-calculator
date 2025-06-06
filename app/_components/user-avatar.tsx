import { BadgeCheck, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Avatar, AvatarFallback } from '@/app/_components/ui/avatar';
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
    <Avatar data-cy="avatar" className="cursor-pointer">
      <AvatarFallback>
        {user?.email?.substring(0, 1).toUpperCase()}
      </AvatarFallback>{' '}
    </Avatar>
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
          <Link href="/users/settings" data-cy="avatar-settings">
            <DropdownMenuItem>
              <BadgeCheck />
              {t('settings')}
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} data-cy="avatar-logout">
          <LogOut />
          {t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
