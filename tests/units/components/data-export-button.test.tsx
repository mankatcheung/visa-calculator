// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { DataExportButton } from '@/app/_components/data-export-button';
import { userActions } from '@/app/actions';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/app/actions', () => ({
  userActions: { getDataExport: vi.fn() },
}));

let createObjectURLSpy: ReturnType<
  typeof vi.fn<(obj: Blob | MediaSource) => string>
>;
let revokeObjectURLSpy: ReturnType<typeof vi.fn<(url: string) => void>>;

beforeEach(() => {
  // jsdom doesn't implement these; the component only needs them called,
  // not a real blob: URL.
  createObjectURLSpy = vi
    .fn<(obj: Blob | MediaSource) => string>()
    .mockReturnValue('blob:mock-url');
  revokeObjectURLSpy = vi.fn<(url: string) => void>();
  URL.createObjectURL = createObjectURLSpy;
  URL.revokeObjectURL = revokeObjectURLSpy;
});

afterEach(() => {
  vi.restoreAllMocks();
});

it('renders the trigger button', () => {
  render(<DataExportButton />);

  expect(
    screen.getByRole('button', { name: 'downloadMyData' })
  ).toBeInTheDocument();
});

it('downloads a JSON file built from the export data on click', async () => {
  vi.mocked(userActions.getDataExport).mockResolvedValue({
    result: {
      exportedAt: '2025-01-01T00:00:00.000Z',
      account: { id: '1', email: 'one@test.com', emailVerified: true },
      visaSettings: null,
      leaves: [],
    },
  });
  render(<DataExportButton />);

  await userEvent.click(screen.getByRole('button', { name: 'downloadMyData' }));

  await waitFor(() => {
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
  });
  const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
  expect(blob.type).toBe('application/json');
  expect(await blob.text()).toContain('one@test.com');
  expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
});

it('shows an error toast when the action returns an error', async () => {
  vi.mocked(userActions.getDataExport).mockResolvedValue({
    error: 'Something went wrong',
  });
  render(<DataExportButton />);

  await userEvent.click(screen.getByRole('button', { name: 'downloadMyData' }));

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith('Something went wrong');
  });
  expect(createObjectURLSpy).not.toHaveBeenCalled();
});
