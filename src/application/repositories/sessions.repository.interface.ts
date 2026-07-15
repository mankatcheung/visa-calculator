import { Session } from '@/src/entities/models/session';
import type { ITransaction } from '@/src/entities/models/transaction.interface';
import { User } from '@/src/entities/models/user';

export interface ISessionsRepository {
  createSession(session: Session, tx?: ITransaction): Promise<Session>;
  getSession(sessionId: string): Promise<{ session: Session; user: User } | undefined>;
  getUserSession(userId: string): Promise<{ session: Session; user: User }>;
  updateSessionExpiresAt(
    sessionId: string,
    newExpiresAt: Date
  ): Promise<Session>;
  deleteSession(sessionId: string): Promise<void>;
  deleteUserSession(userId: string, tx?: ITransaction): Promise<void>;
  deleteOtherSessionsByUserId(
    userId: string,
    currentSessionId: string
  ): Promise<void>;
}
