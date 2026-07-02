// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { expect, it, vi } from 'vitest';

import { DeleteAccountForm } from '@/app/_components/delete-account-form';
import { userActions } from '@/app/actions';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/app/actions', () => ({
  userActions: { deleteAccount: vi.fn() },
}));

it('renders the trigger button', () => {
  render(<DeleteAccountForm />);

  expect(
    screen.getByRole('button', { name: 'deleteAccount' })
  ).toBeInTheDocument();
});

it('opens a confirmation dialog requiring the current password on click', async () => {
  render(<DeleteAccountForm />);

  await userEvent.click(screen.getByRole('button', { name: 'deleteAccount' }));

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('deleteAccountConfirmation')).toBeInTheDocument();
  expect(screen.getByLabelText('currentPassword')).toBeInTheDocument();
});

it('shows pleaseInput when submitted without a password', async () => {
  render(<DeleteAccountForm />);

  await userEvent.click(screen.getByRole('button', { name: 'deleteAccount' }));
  await userEvent.click(screen.getByRole('button', { name: 'confirm' }));

  expect(await screen.findByText('pleaseInput')).toBeInTheDocument();
  expect(userActions.deleteAccount).not.toHaveBeenCalled();
});

it('calls userActions.deleteAccount with the password on confirm', async () => {
  // A successful call redirects server-side and never resolves with a
  // value the client sees; the mock is left unconfigured (resolves
  // `undefined` by default) to match that, since only the invocation
  // itself is under test here.
  render(<DeleteAccountForm />);

  await userEvent.click(screen.getByRole('button', { name: 'deleteAccount' }));
  await userEvent.type(screen.getByLabelText('currentPassword'), 'my-password');
  await userEvent.click(screen.getByRole('button', { name: 'confirm' }));

  await waitFor(() => {
    expect(userActions.deleteAccount).toHaveBeenCalledTimes(1);
  });
  const formData = vi.mocked(userActions.deleteAccount).mock.calls[0][0];
  expect(formData.get('currentPassword')).toBe('my-password');
});

it('shows an error toast when the action returns an error', async () => {
  vi.mocked(userActions.deleteAccount).mockResolvedValue({
    error: 'Current password is incorrect',
  });
  render(<DeleteAccountForm />);

  await userEvent.click(screen.getByRole('button', { name: 'deleteAccount' }));
  await userEvent.type(screen.getByLabelText('currentPassword'), 'wrong');
  await userEvent.click(screen.getByRole('button', { name: 'confirm' }));

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith('Current password is incorrect');
  });
});
