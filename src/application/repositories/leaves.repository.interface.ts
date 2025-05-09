import type {
  Leave,
  LeaveInsert,
  LeaveUpdate,
} from '@/src/entities/models/leave';

export interface ILeavesRepository {
  createLeave(leave: LeaveInsert, tx?: any): Promise<Leave>;
  getLeave(id: number): Promise<Leave | undefined>;
  getLeavesForUser(userId: string): Promise<Leave[]>;
  updateLeave(
    id: number,
    input: Partial<LeaveUpdate>,
    tx?: any
  ): Promise<Leave>;
  deleteLeave(id: number, tx?: any): Promise<void>;
}
