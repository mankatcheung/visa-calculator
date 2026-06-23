import { BadgeCheck, LogOut, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { Avatar, AvatarFallback } from '@/app/_components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/_components/ui/dropdown-menu';
import { Skeleton } from '@/app/_components/ui/skeleton';
import { authActions } from '@/app/actions';
import useUser from '@/hooks/use-user';
import { Link } from '@/i18n/navigation';

export function UserAvatar() {
  const t = useTranslations();
  const user = useUser();
  const [signingOut, startSignOut] = useTransition();

  const onSignOut = () => {
    if (signingOut) return;
    startSignOut(async () => {
      await authActions.signOut();
    });
  };

  if (user === undefined) {
    return (
      <Skeleton data-cy="avatar-skeleton" className="h-8 w-8 rounded-full" />
    );
  }

  const avatar = (
    <Avatar
      data-cy="avatar"
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={t('user')}
    >
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
        <DropdownMenuItem
          onClick={onSignOut}
          data-cy="avatar-logout"
          disabled={signingOut}
        >
          {signingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
          {t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
