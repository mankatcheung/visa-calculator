import { Avatar } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { BadgeCheck, LogOut } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { authActions } from '@/app/actions';
import useUser from '@/hooks/use-user';

export function UserAvatar() {
  const t = useTranslations();
  const user = useUser();

  const onSignOut = async () => {
    await authActions.signOut();
  };

  const avatar = (
    <Avatar className="h-8 w-8 rounded-full border-white border-1 text-center cursor-pointer">
      {user?.email?.substring(0, 1).toUpperCase()}
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
