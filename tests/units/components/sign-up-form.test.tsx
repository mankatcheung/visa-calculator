// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { expect, it, vi } from 'vitest';

import { SignUpForm } from '@/app/_components/sign-up-form';
import { authActions } from '@/app/actions';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/app/actions', () => ({
  authActions: { signUp: vi.fn() },
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

it('renders the email, password, and confirm password fields', () => {
  render(<SignUpForm />);

  expect(screen.getByLabelText('email')).toBeInTheDocument();
  expect(screen.getByLabelText('password')).toBeInTheDocument();
  expect(screen.getByLabelText('confirmPassword')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'signUp' })).toBeInTheDocument();
});

it('does not show the password strength meter before typing a password', () => {
  render(<SignUpForm />);

  expect(
    screen.queryByText('passwordStrength:', { exact: false })
  ).not.toBeInTheDocument();
});

it('shows the password strength meter as the password field is typed into', async () => {
  render(<SignUpForm />);

  await userEvent.type(screen.getByLabelText('password'), 'password');
  expect(
    screen.getByText('passwordStrength: passwordStrengthVeryWeak')
  ).toBeInTheDocument();

  await userEvent.clear(screen.getByLabelText('password'));
  await userEvent.type(
    screen.getByLabelText('password'),
    'Tr0ub4dor&Xk9mPqLz!'
  );
  expect(
    screen.getByText('passwordStrength: passwordStrengthStrong')
  ).toBeInTheDocument();
});

it('does not show the strength meter for the confirm password field', async () => {
  render(<SignUpForm />);

  await userEvent.type(
    screen.getByLabelText('confirmPassword'),
    'Tr0ub4dor&Xk9mPqLz!'
  );

  expect(
    screen.queryByText('passwordStrength:', { exact: false })
  ).not.toBeInTheDocument();
});

it('calls authActions.signUp on submit', async () => {
  // A successful sign-up redirects server-side and never resolves with a
  // value the client sees; the mock is left unconfigured (resolves
  // `undefined` by default) to match that.
  render(<SignUpForm />);

  await userEvent.type(screen.getByLabelText('email'), 'new@test.com');
  await userEvent.type(
    screen.getByLabelText('password'),
    'Tr0ub4dor&Xk9mPqLz!'
  );
  await userEvent.type(
    screen.getByLabelText('confirmPassword'),
    'Tr0ub4dor&Xk9mPqLz!'
  );
  await userEvent.click(screen.getByRole('button', { name: 'signUp' }));

  expect(authActions.signUp).toHaveBeenCalledTimes(1);
});

it('shows an error toast when the action returns an error', async () => {
  vi.mocked(authActions.signUp).mockResolvedValue({ error: 'Email taken' });
  render(<SignUpForm />);

  await userEvent.type(screen.getByLabelText('email'), 'new@test.com');
  await userEvent.type(
    screen.getByLabelText('password'),
    'Tr0ub4dor&Xk9mPqLz!'
  );
  await userEvent.type(
    screen.getByLabelText('confirmPassword'),
    'Tr0ub4dor&Xk9mPqLz!'
  );
  await userEvent.click(screen.getByRole('button', { name: 'signUp' }));

  expect(toast.error).toHaveBeenCalledWith('Email taken');
});
