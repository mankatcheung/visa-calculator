// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';

import { LeaveForm } from '@/app/_components/leave-form';
import { leaveActions } from '@/app/actions';
import { useRouter } from '@/i18n/navigation';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/app/actions', () => ({
  leaveActions: { createLeave: vi.fn(), updateLeave: vi.fn() },
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/app/_components/date-picker', () => ({
  DatePicker: ({
    value,
    onChange,
    ...props
  }: {
    value?: Date;
    onChange: (d: Date | undefined) => void;
  }) => (
    <input
      type="text"
      value={value ? value.toISOString() : ''}
      onChange={(e) =>
        onChange(e.target.value ? new Date(e.target.value) : undefined)
      }
      {...props}
    />
  ),
}));

vi.mock('@/app/_components/color-picker', () => ({
  GradientPicker: ({
    background,
    setBackground,
    ...props
  }: {
    background?: string;
    setBackground: (c: string) => void;
  }) => (
    <input
      type="text"
      value={background ?? ''}
      onChange={(e) => setBackground(e.target.value)}
      {...props}
    />
  ),
}));

function mockRouter() {
  const push = vi.fn();
  vi.mocked(useRouter).mockReturnValue({
    push,
  } as unknown as ReturnType<typeof useRouter>);
  return push;
}

const fakeLeaveResult = {
  id: 1,
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  startDate: new Date('2025-06-01T00:00:00.000Z'),
  endDate: new Date('2025-06-10T00:00:00.000Z'),
  color: '#123212',
  remarks: null,
  userId: 'user-1',
};

// The mocked DatePicker's onChange parses its full input value as a Date on
// every change event. Setting the value in one shot (rather than simulating
// keystroke-by-keystroke typing) avoids feeding it invalid partial strings.
function setDateInput(label: string, isoString: string) {
  fireEvent.change(screen.getByLabelText(label), {
    target: { value: isoString },
  });
}

it('renders the date, color, remarks fields and a submit button', () => {
  mockRouter();
  render(<LeaveForm />);

  expect(screen.getByLabelText('startDate')).toBeInTheDocument();
  expect(screen.getByLabelText('endDate')).toBeInTheDocument();
  expect(screen.getByLabelText('color')).toBeInTheDocument();
  expect(screen.getByLabelText('remarks')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'submit' })).toBeInTheDocument();
});

it('shows both date-required errors when submitted with no dates set', async () => {
  mockRouter();
  render(<LeaveForm />);

  await userEvent.click(screen.getByRole('button', { name: 'submit' }));

  expect(
    await screen.findByText('startDateRequiredWarning')
  ).toBeInTheDocument();
  expect(screen.getByText('endDateRequiredWarning')).toBeInTheDocument();
});

it('shows wrongDateRange when endDate is before startDate', async () => {
  mockRouter();
  render(<LeaveForm />);

  setDateInput('startDate', '2025-06-10T00:00:00.000Z');
  setDateInput('endDate', '2025-06-01T00:00:00.000Z');
  await userEvent.click(screen.getByRole('button', { name: 'submit' }));

  expect(await screen.findByText('wrongDateRange')).toBeInTheDocument();
  expect(
    screen.queryByText('startDateRequiredWarning')
  ).not.toBeInTheDocument();
});

describe('create mode (no leave prop)', () => {
  it('calls leaveActions.createLeave and navigates on success', async () => {
    vi.mocked(leaveActions.createLeave).mockResolvedValue({
      result: fakeLeaveResult,
    });
    const push = mockRouter();
    render(<LeaveForm />);

    setDateInput('startDate', '2025-06-01T00:00:00.000Z');
    setDateInput('endDate', '2025-06-10T00:00:00.000Z');
    await userEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => {
      expect(leaveActions.createLeave).toHaveBeenCalledTimes(1);
    });
    const formData = vi.mocked(leaveActions.createLeave).mock.calls[0][0];
    expect(formData.get('id')).toBeNull();
    expect(toast.success).toHaveBeenCalledWith('success');
    expect(push).toHaveBeenCalledWith('/leaves');
  });

  it('shows an error toast when the action returns an error', async () => {
    vi.mocked(leaveActions.createLeave).mockResolvedValue({
      error: 'Something went wrong',
    });
    mockRouter();
    render(<LeaveForm />);

    setDateInput('startDate', '2025-06-01T00:00:00.000Z');
    setDateInput('endDate', '2025-06-10T00:00:00.000Z');
    await userEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Something went wrong');
    });
  });
});

describe('edit mode (leave prop provided)', () => {
  it('calls leaveActions.updateLeave with the leave id', async () => {
    vi.mocked(leaveActions.updateLeave).mockResolvedValue({
      result: fakeLeaveResult,
    });
    mockRouter();
    render(
      <LeaveForm
        leave={{
          id: 42,
          startDate: new Date('2025-06-01T00:00:00.000Z'),
          endDate: new Date('2025-06-10T00:00:00.000Z'),
          color: '#abcdef',
          remarks: 'existing remark',
        }}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => {
      expect(leaveActions.updateLeave).toHaveBeenCalledTimes(1);
    });
    const formData = vi.mocked(leaveActions.updateLeave).mock.calls[0][0];
    expect(formData.get('id')).toBe('42');
    expect(leaveActions.createLeave).not.toHaveBeenCalled();
  });
});
