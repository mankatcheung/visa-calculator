// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';

import { ChangePasswordForm } from '@/app/_components/change-password-form';
import { userActions } from '@/app/actions';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/app/actions', () => ({
  userActions: { changePassword: vi.fn() },
}));

it('renders all three password fields and a submit button', () => {
  render(<ChangePasswordForm />);

  expect(screen.getByLabelText('currentPassword')).toBeInTheDocument();
  expect(screen.getByLabelText('newPassword')).toBeInTheDocument();
  expect(screen.getByLabelText('confirmPassword')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'submit' })).toBeInTheDocument();
});

it('shows pleaseInput under each field when submitted empty', async () => {
  render(<ChangePasswordForm />);

  await userEvent.click(screen.getByRole('button', { name: 'submit' }));

  expect(await screen.findAllByText('pleaseInput')).toHaveLength(3);
});

it('shows passwordNotMatched under confirmPassword when passwords differ', async () => {
  render(<ChangePasswordForm />);

  await userEvent.type(screen.getByLabelText('currentPassword'), 'current123');
  await userEvent.type(screen.getByLabelText('newPassword'), 'new123');
  await userEvent.type(
    screen.getByLabelText('confirmPassword'),
    'different456'
  );
  await userEvent.click(screen.getByRole('button', { name: 'submit' }));

  expect(await screen.findByText('passwordNotMatched')).toBeInTheDocument();
  expect(screen.queryByText('pleaseInput')).not.toBeInTheDocument();
});

describe('on valid submission', () => {
  it('calls userActions.changePassword with the form data and shows a success toast', async () => {
    vi.mocked(userActions.changePassword).mockResolvedValue({
      result: { id: 'user-1', email: 'test@test.com' },
    });
    render(<ChangePasswordForm />);

    await userEvent.type(
      screen.getByLabelText('currentPassword'),
      'current123'
    );
    await userEvent.type(screen.getByLabelText('newPassword'), 'new123');
    await userEvent.type(screen.getByLabelText('confirmPassword'), 'new123');
    await userEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => {
      expect(userActions.changePassword).toHaveBeenCalledTimes(1);
    });
    const formData = vi.mocked(userActions.changePassword).mock.calls[0][0];
    expect(formData.get('currentPassword')).toBe('current123');
    expect(formData.get('newPassword')).toBe('new123');
    expect(formData.get('confirmPassword')).toBe('new123');
    expect(toast.success).toHaveBeenCalledWith('success');
  });

  it('shows an error toast when the action returns an error', async () => {
    vi.mocked(userActions.changePassword).mockResolvedValue({
      error: 'Incorrect current password',
    });
    render(<ChangePasswordForm />);

    await userEvent.type(screen.getByLabelText('currentPassword'), 'wrong');
    await userEvent.type(screen.getByLabelText('newPassword'), 'new123');
    await userEvent.type(screen.getByLabelText('confirmPassword'), 'new123');
    await userEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Incorrect current password');
    });
  });
});
