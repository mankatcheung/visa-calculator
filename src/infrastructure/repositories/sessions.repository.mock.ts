import { PASSWORD_SALT_ROUNDS } from '@/config';
import { ISessionsRepository } from '@/src/application/repositories/sessions.repository.interface';

import { Session } from '@/src/entities/models/session';
import { User } from '@/src/entities/models/user';
import { hashSync } from 'bcrypt-ts';

export class MockSessionsRepository implements ISessionsRepository {
  private _sessions: Session[];
  private _users: User[];

  constructor() {
    const fourHoursLater = new Date();
    fourHoursLater.setHours(fourHoursLater.getHours() + 4);
    this._sessions = [];
    this._users = [
      {
        id: '1',
        email: 'one@test.com',
        passwordHash: hashSync('password-one', PASSWORD_SALT_ROUNDS),
      },
      {
        id: '2',
        email: 'two@test.com',
        passwordHash: hashSync('password-two', PASSWORD_SALT_ROUNDS),
      },
      {
        id: '3',
        email: 'three@test.com',
        passwordHash: hashSync('password-three', PASSWORD_SALT_ROUNDS),
      },
    ];
  }

  async createSession(session: Session): Promise<Session> {
    this._sessions.push(session);
    return session;
  }

  async getSession(
    sessionId: string
  ): Promise<{ session: Session; user: User }> {
    const session = this._sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error('no session found');
    const user = this._users.find((u) => u.id === session.userId);
    if (!user) throw new Error('no user found');
    return {
      session,
      user,
    };
  }

  async getUserSession(
    userId: string
  ): Promise<{ session: Session; user: User }> {
    const session = this._sessions.find((s) => s.userId === userId);
    if (!session) throw new Error('no session found');
    const user = this._users.find((u) => u.id === userId);
    if (!user) throw new Error('no user found');
    return {
      session,
      user,
    };
  }

  async updateSessionExpiresAt(
    sessionId: string,
    newExpiresAt: Date
  ): Promise<Session> {
    const sessionIndex = this._sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex < 0) throw new Error('no session found');
    const newSession = {
      ...this._sessions[sessionIndex],
      expiresAt: newExpiresAt,
    };
    this._sessions[sessionIndex] = newSession;
    return newSession;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const sessionIndex = this._sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex > -1) this._sessions.splice(sessionIndex, 1);
  }

  async deleteUserSession(userId: string): Promise<void> {
    const newSessions = this._sessions.filter((s) => s.userId !== userId);
    this._sessions = newSessions;
  }
}
