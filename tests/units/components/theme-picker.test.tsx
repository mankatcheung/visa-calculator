// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTheme } from 'next-themes';
import { describe, expect, it, vi } from 'vitest';

import { ThemePicker } from '@/app/_components/theme-picker';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

function mockUseTheme(theme: string, setTheme = vi.fn()) {
  vi.mocked(useTheme).mockReturnValue({
    theme,
    setTheme,
    themes: ['light', 'dark', 'system'],
  });
  return setTheme;
}

it('renders the trigger button', () => {
  mockUseTheme('light');
  render(<ThemePicker />);

  expect(screen.getByRole('button')).toBeInTheDocument();
});

it('opens the dropdown on click', async () => {
  mockUseTheme('light');
  render(<ThemePicker />);

  await userEvent.click(screen.getByRole('button'));

  expect(screen.getByRole('menu')).toBeInTheDocument();
});

it('shows the three theme options with translated labels', async () => {
  mockUseTheme('light');
  render(<ThemePicker />);

  await userEvent.click(screen.getByRole('button'));

  expect(
    screen.getByRole('menuitemradio', { name: 'light' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('menuitemradio', { name: 'dark' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('menuitemradio', { name: 'system' })
  ).toBeInTheDocument();
});

it('calls setTheme with the clicked option', async () => {
  const setTheme = mockUseTheme('light');
  render(<ThemePicker />);

  await userEvent.click(screen.getByRole('button'));
  await userEvent.click(screen.getByRole('menuitemradio', { name: 'dark' }));

  expect(setTheme).toHaveBeenCalledWith('dark');
});

describe('active theme reflects the current value', () => {
  it('marks the active option as checked and others as unchecked', async () => {
    mockUseTheme('dark');
    render(<ThemePicker />);

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('menuitemradio', { name: 'dark' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(
      screen.getByRole('menuitemradio', { name: 'light' })
    ).toHaveAttribute('aria-checked', 'false');
    expect(
      screen.getByRole('menuitemradio', { name: 'system' })
    ).toHaveAttribute('aria-checked', 'false');
  });
});
