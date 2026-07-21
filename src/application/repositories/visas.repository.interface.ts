import type { CreateVisa, UpdateVisa, Visa } from '@/src/entities/models/visa';

export interface IVisasRepository {
  createVisa(data: CreateVisa, userId: string, tx?: any): Promise<Visa>;
  getVisa(id: number, userId: string): Promise<Visa | undefined>;
  getVisasForUser(userId: string): Promise<Visa[]>;
  updateVisa(id: number, userId: string, data: Partial<UpdateVisa>, tx?: any): Promise<Visa>;
  deleteVisa(id: number, userId: string, tx?: any): Promise<void>;
  deleteVisasForUser(userId: string, tx?: any): Promise<void>;
}
