import { ILeavesRepository } from '@/src/application/repositories/leaves.repository.interface';
import { Leave, LeaveInsert, LeaveUpdate } from '@/src/entities/models/leave';

export class MockLeavesRepository implements ILeavesRepository {
  private _leaves: Leave[];

  constructor() {
    this._leaves = [];
  }

  async createLeave(leave: LeaveInsert): Promise<Leave> {
    const id = this._leaves.length + 1;
    const created = { ...leave, id, createdAt: new Date() };
    this._leaves.push(created);
    return created;
  }

  async getLeave(id: number): Promise<Leave | undefined> {
    const leave = this._leaves.find((t) => t.id === id);
    return leave;
  }

  async getLeavesForUser(userId: string): Promise<Leave[]> {
    const usersLeaves = this._leaves.filter((t) => t.userId === userId);
    return usersLeaves;
  }

  async updateLeave(id: number, input: Partial<LeaveUpdate>): Promise<Leave> {
    const existingIndex = this._leaves.findIndex((t) => t.id === id);
    const updated = {
      ...this._leaves[existingIndex],
      ...input,
    };
    this._leaves[existingIndex] = updated;
    return updated;
  }

  async deleteLeave(id: number): Promise<void> {
    const existingIndex = this._leaves.findIndex((t) => t.id === id);
    if (existingIndex > -1) {
      delete this._leaves[existingIndex];
      this._leaves = this._leaves.filter(Boolean);
    }
  }
}
