import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';

export function ThemePicker() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="cursor-pointer" variant="outline" size="icon">
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
          <DropdownMenuRadioItem value="light">
            {t('light')}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            {t('dark')}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            {t('system')}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
