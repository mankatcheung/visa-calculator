import { Session } from "@/src/entities/models/session";
import { User } from "@/src/entities/models/user";

export interface ISessionsRepository {
  createSession(session: Session): Promise<Session>;
  getSession(sessionId: string): Promise<{ session: Session; user: User }>;
  getUserSession(userId: string): Promise<{ session: Session; user: User }>;
  updateSessionExpiresAt(
    sessionId: string,
    newExpiresAt: Date,
  ): Promise<Session>;
  deleteSession(sessionId: string): Promise<void>;
  deleteUserSession(userId: string): Promise<void>;
}
