// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';

import { LeaveDeleteButton } from '@/app/_components/leave-delete-button';
import { leaveActions } from '@/app/actions';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/app/actions', () => ({
  leaveActions: { deleteLeave: vi.fn() },
}));

const startDate = new Date('2025-06-01T00:00:00.000Z');
const endDate = new Date('2025-06-10T00:00:00.000Z');

it('renders the trigger button', () => {
  render(<LeaveDeleteButton id={1} startDate={startDate} endDate={endDate} />);

  expect(screen.getByRole('button')).toBeInTheDocument();
});

it('opens a confirmation dialog showing the date range on click', async () => {
  render(<LeaveDeleteButton id={1} startDate={startDate} endDate={endDate} />);

  await userEvent.click(screen.getByRole('button'));

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('deleteLeave')).toBeInTheDocument();
  expect(screen.getByText('deleteReminder')).toBeInTheDocument();
  expect(
    screen.getByText('June 1st, 2025 - June 10th, 2025')
  ).toBeInTheDocument();
});

describe('on confirm', () => {
  it('calls leaveActions.deleteLeave with the id and shows a success toast', async () => {
    vi.mocked(leaveActions.deleteLeave).mockResolvedValue({ success: 'ok' });
    render(
      <LeaveDeleteButton id={7} startDate={startDate} endDate={endDate} />
    );

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByRole('button', { name: 'confirm' }));

    await waitFor(() => {
      expect(leaveActions.deleteLeave).toHaveBeenCalledWith(7);
    });
    expect(toast.success).toHaveBeenCalledWith('success');
  });

  it('shows an error toast when the action returns an error', async () => {
    vi.mocked(leaveActions.deleteLeave).mockResolvedValue({
      error: 'Something went wrong',
    });
    render(
      <LeaveDeleteButton id={7} startDate={startDate} endDate={endDate} />
    );

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByRole('button', { name: 'confirm' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Something went wrong');
    });
  });
});
