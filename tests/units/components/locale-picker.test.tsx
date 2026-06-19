// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocale } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import { LocalePicker } from '@/app/_components/locale-picker';
import { usePathname, useRouter } from '@/i18n/navigation';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

function mockNavigation(locale: string) {
  vi.mocked(useLocale).mockReturnValue(locale);
  vi.mocked(usePathname).mockReturnValue('/leaves');
  const replace = vi.fn();
  vi.mocked(useRouter).mockReturnValue({
    replace,
  } as unknown as ReturnType<typeof useRouter>);
  return replace;
}

it('renders the trigger button', () => {
  mockNavigation('en');
  render(<LocalePicker />);

  expect(screen.getByRole('button')).toBeInTheDocument();
});

it('shows both locale options with translated labels', async () => {
  mockNavigation('en');
  render(<LocalePicker />);

  await userEvent.click(screen.getByRole('button'));

  expect(
    screen.getByRole('menuitemradio', { name: 'english' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('menuitemradio', { name: 'traditionalChinese' })
  ).toBeInTheDocument();
});

it('calls router.replace with the new locale when an option is clicked', async () => {
  const replace = mockNavigation('en');
  render(<LocalePicker />);

  await userEvent.click(screen.getByRole('button'));
  await userEvent.click(
    screen.getByRole('menuitemradio', { name: 'traditionalChinese' })
  );

  expect(replace).toHaveBeenCalledWith('/leaves', { locale: 'zh-Hant-HK' });
});

describe('active locale reflects the current value', () => {
  it('marks the current locale as checked and the other as unchecked', async () => {
    mockNavigation('zh-Hant-HK');
    render(<LocalePicker />);

    await userEvent.click(screen.getByRole('button'));

    expect(
      screen.getByRole('menuitemradio', { name: 'traditionalChinese' })
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('menuitemradio', { name: 'english' })
    ).toHaveAttribute('aria-checked', 'false');
  });
});
