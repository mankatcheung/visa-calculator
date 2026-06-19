// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { UserAvatar } from '@/app/_components/user-avatar';
import { authActions } from '@/app/actions';
import useUser from '@/hooks/use-user';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/app/actions', () => ({
  authActions: { signOut: vi.fn() },
}));

vi.mock('@/hooks/use-user', () => ({
  default: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

it('renders the avatar trigger with the first letter of the user email', () => {
  vi.mocked(useUser).mockReturnValue({ email: 'jane@test.com' });
  render(<UserAvatar />);

  expect(screen.getByRole('button', { name: 'user' })).toHaveTextContent('J');
});

it('shows settings and sign out options when opened', async () => {
  vi.mocked(useUser).mockReturnValue({ email: 'jane@test.com' });
  render(<UserAvatar />);

  await userEvent.click(screen.getByRole('button', { name: 'user' }));

  expect(screen.getByRole('link', { name: 'settings' })).toHaveAttribute(
    'href',
    expect.stringContaining('/users/settings')
  );
  expect(screen.getByRole('menuitem', { name: 'signOut' })).toBeInTheDocument();
});

describe('on sign out', () => {
  it('calls authActions.signOut when clicked', async () => {
    vi.mocked(useUser).mockReturnValue({ email: 'jane@test.com' });
    render(<UserAvatar />);

    await userEvent.click(screen.getByRole('button', { name: 'user' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'signOut' }));

    await waitFor(() => {
      expect(authActions.signOut).toHaveBeenCalledTimes(1);
    });
  });
});
