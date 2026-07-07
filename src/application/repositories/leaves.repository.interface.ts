import type {
  Leave,
  LeaveInsert,
  LeaveUpdate,
  PaginatedLeaves,
} from '@/src/entities/models/leave';

export interface ILeavesRepository {
  createLeave(leave: LeaveInsert, tx?: any): Promise<Leave>;
  getLeave(id: number): Promise<Leave | undefined>;
  getLeavesForUser(userId: string): Promise<Leave[]>;
  getPaginatedLeavesForUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedLeaves>;
  updateLeave(
    id: number,
    input: Partial<LeaveUpdate>,
    tx?: any
  ): Promise<Leave>;
  deleteLeave(id: number, userId: string, tx?: any): Promise<void>;
  deleteLeavesForUser(userId: string, tx?: any): Promise<void>;
}
