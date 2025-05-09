import { compare } from 'bcrypt-ts';

import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { User } from '@/src/entities/models/user';
import { Session } from '@/src/entities/models/session';
import { Cookie } from '@/src/entities/models/cookie';
import { SESSION_COOKIE } from '@/config';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { type ISessionsRepository } from '@/src/application/repositories/sessions.repository.interface';

export class MockAuthenticationService implements IAuthenticationService {
  constructor(private _sessionRepository: ISessionsRepository) {}

  validatePasswords(
    inputPassword: string,
    usersHashedPassword: string
  ): Promise<boolean> {
    return compare(inputPassword, usersHashedPassword);
  }

  async validateSession(
    token: string
  ): Promise<{ user: User; session: Session }> {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );
    const result = await this._sessionRepository.getSession(sessionId);

    if (!result.user || !result.session) {
      throw new UnauthenticatedError('Unauthenticated');
    }

    if (Date.now() >= new Date(result.session.expiresAt).getTime()) {
      await this._sessionRepository.deleteSession(sessionId);
      throw new UnauthenticatedError('Session Expired');
    }
    if (
      Date.now() >=
      result.session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15
    ) {
      await this._sessionRepository.updateSessionExpiresAt(
        sessionId,
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      );
    }

    if (!result.user) {
      throw new UnauthenticatedError("User doesn't exist");
    }

    return { user: result.user, session: result.session };
  }

  async createSession(
    user: User
  ): Promise<{ session: Session; cookie: Cookie }> {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = `random_session_id_${user.id}`;
    // generate the session id from the token
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );
    // expires in 30 days
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    const session = await this._sessionRepository.createSession({
      id: sessionId,
      userId: user.id,
      expiresAt: expiresAt,
    });

    const cookie: Cookie = {
      name: SESSION_COOKIE,
      value: token,
      attributes: {},
    };

    return { session, cookie };
  }

  async invalidateSession(token: string): Promise<{ blankCookie: Cookie }> {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );
    await this._sessionRepository.deleteSession(sessionId);
    const blankCookie: Cookie = {
      name: SESSION_COOKIE,
      value: '',
      attributes: {},
    };

    return Promise.resolve({ blankCookie });
  }

  generateUserId(): string {
    return (Math.random() + 1).toString(36).substring(7);
  }
}
