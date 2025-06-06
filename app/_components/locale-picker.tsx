import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/app/_components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/app/_components/ui/dropdown-menu';
import { usePathname, useRouter } from '@/i18n/navigation';

export function LocalePicker() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const onChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          data-cy="locale-picker"
          className="cursor-pointer"
          variant="outline"
          size="icon"
        >
          <Languages />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={'bottom'}
        align="start"
        sideOffset={4}
      >
        <DropdownMenuRadioGroup value={locale} onValueChange={onChange}>
          <DropdownMenuRadioItem value="en" data-cy="locale-picker-en">
            {t('english')}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="zh-Hant-HK"
            data-cy="locale-picker-zh-Hant-HK"
          >
            {t('traditionalChinese')}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
