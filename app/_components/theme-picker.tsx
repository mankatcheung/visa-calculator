import { Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import { Button } from '@/app/_components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/app/_components/ui/dropdown-menu';

export function ThemePicker() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          data-cy="theme-picker"
          className="cursor-pointer"
          variant="outline"
          size="icon"
        >
          <Moon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={'bottom'}
        align="start"
        sideOffset={4}
      >
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light" data-cy="theme-picker-light">
            {t('light')}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" data-cy="theme-picker-dark">
            {t('dark')}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" data-cy="theme-picker-system">
            {t('system')}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
