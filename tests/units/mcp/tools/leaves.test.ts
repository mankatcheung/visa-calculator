import { expect, it } from 'vitest';

import { InputParseError } from '@/src/entities/errors/common';
import {
  createLeaveHandler,
  deleteLeaveHandler,
  getLeavesHandler,
  updateLeaveHandler,
} from '@/src/interface-adapters/mcp/tools/leaves';

const USER_ID = '1';

it('get_leaves returns an array', async () => {
  const result = await getLeavesHandler(USER_ID);
  expect(result.content[0].type).toBe('text');
  const leaves = JSON.parse(result.content[0].text);
  expect(Array.isArray(leaves)).toBe(true);
});

it('create_leave creates a record visible in get_leaves', async () => {
  const created = await createLeaveHandler(USER_ID, {
    startDate: '2025-08-01',
    endDate: '2025-08-10',
    color: '#ff0000',
    remarks: 'MCP test',
  });
  const leave = JSON.parse(created.content[0].text);
  expect(leave.userId).toBe(USER_ID);
  expect(leave.color).toBe('#ff0000');

  const list = await getLeavesHandler(USER_ID);
  const leaves = JSON.parse(list.content[0].text);
  expect(leaves.some((l: { id: number }) => l.id === leave.id)).toBe(true);
});

it('update_leave changes the record fields', async () => {
  const created = await createLeaveHandler(USER_ID, {
    startDate: '2025-09-01',
    endDate: '2025-09-05',
  });
  const { id } = JSON.parse(created.content[0].text);

  const updated = await updateLeaveHandler(USER_ID, {
    id,
    startDate: '2025-09-02',
    endDate: '2025-09-07',
    remarks: 'updated via MCP',
  });
  const updatedLeave = JSON.parse(updated.content[0].text);
  expect(updatedLeave.remarks).toBe('updated via MCP');
});

it('delete_leave removes the record', async () => {
  const created = await createLeaveHandler(USER_ID, {
    startDate: '2025-10-01',
    endDate: '2025-10-03',
  });
  const { id } = JSON.parse(created.content[0].text);

  await deleteLeaveHandler(USER_ID, { id });

  const list = await getLeavesHandler(USER_ID);
  const leaves = JSON.parse(list.content[0].text);
  expect(leaves.some((l: { id: number }) => l.id === id)).toBe(false);
});

it('create_leave rejects when startDate is after endDate', async () => {
  await expect(
    createLeaveHandler(USER_ID, {
      startDate: '2025-08-10',
      endDate: '2025-08-01',
    })
  ).rejects.toBeInstanceOf(InputParseError);
});
