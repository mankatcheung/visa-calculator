// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { PasswordStrengthMeter } from '@/app/_components/password-strength-meter';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

it('renders nothing for an empty password', () => {
  const { container } = render(<PasswordStrengthMeter password="" />);

  expect(container).toBeEmptyDOMElement();
});

it('shows the very-weak label for a common password', () => {
  render(<PasswordStrengthMeter password="password" />);

  expect(
    screen.getByText('passwordStrength: passwordStrengthVeryWeak')
  ).toBeInTheDocument();
});

it('shows the strong label for a long password with full variety', () => {
  render(<PasswordStrengthMeter password="Tr0ub4dor&Xk9mPqLz!" />);

  expect(
    screen.getByText('passwordStrength: passwordStrengthStrong')
  ).toBeInTheDocument();
});

it('updates the label as the password changes', () => {
  const { rerender } = render(<PasswordStrengthMeter password="short1" />);
  expect(
    screen.getByText('passwordStrength: passwordStrengthVeryWeak')
  ).toBeInTheDocument();

  rerender(<PasswordStrengthMeter password="Tr0ub4dor&Xk9mPqLz!" />);
  expect(
    screen.getByText('passwordStrength: passwordStrengthStrong')
  ).toBeInTheDocument();
});
