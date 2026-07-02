import { sha256 } from '@oslojs/crypto/sha2';
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding';
import { compare } from 'bcrypt-ts';

import {
  SESSION_COOKIE,
  SESSION_EXPIRY_MS,
  SESSION_RENEWAL_THRESHOLD_MS,
} from '@/config';

import { ISessionsRepository } from '@/src/application/repositories/sessions.repository.interface';
import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { Cookie } from '@/src/entities/models/cookie';
import { Session } from '@/src/entities/models/session';
import type { ITransaction } from '@/src/entities/models/transaction.interface';
import { User } from '@/src/entities/models/user';

function generateIdFromEntropySize(entropyBytes: number): string {
  // Ensure entropyBytes is a positive integer
  if (!Number.isInteger(entropyBytes) || entropyBytes <= 0) {
    throw new Error('Entropy size must be a positive integer');
  }

  // Generate cryptographically secure random bytes
  const bytes = crypto.getRandomValues(new Uint8Array(entropyBytes));

  // Base62 alphabet (0-9, a-z, A-Z)
  const base62 =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // Convert bytes to base62
  let id = '';
  for (const byte of bytes) {
    id += base62[byte % 62];
  }

  return id;
}

export class AuthenticationService implements IAuthenticationService {
  constructor(
    private readonly _sessionRepository: ISessionsRepository,
    private readonly _instrumentationService: IInstrumentationService
  ) {}

  validatePasswords(
    inputPassword: string,
    usersHashedPassword: string
  ): Promise<boolean> {
    return this._instrumentationService.startSpan(
      { name: 'verify password hash', op: 'function' },
      () => compare(inputPassword, usersHashedPassword)
    );
  }

  async validateSession(
    token: string
  ): Promise<{ user: User; session: Session }> {
    return await this._instrumentationService.startSpan(
      { name: 'AuthenticationService > validateSession' },
      async () => {
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

        let session = result.session;
        if (
          Date.now() >=
          session.expiresAt.getTime() - SESSION_RENEWAL_THRESHOLD_MS
        ) {
          session = await this._sessionRepository.updateSessionExpiresAt(
            sessionId,
            new Date(Date.now() + SESSION_EXPIRY_MS)
          );
        }

        if (!result.user) {
          throw new UnauthenticatedError("User doesn't exist");
        }

        return { user: result.user, session };
      }
    );
  }

  async createSession(
    user: User,
    tx?: ITransaction
  ): Promise<{ session: Session; cookie: Cookie }> {
    return await this._instrumentationService.startSpan(
      { name: 'AuthenticationService > createSession' },
      async () => {
        // generate the token
        const bytes = new Uint8Array(20);
        crypto.getRandomValues(bytes);
        const token = encodeBase32LowerCaseNoPadding(bytes);
        // generate the session id from the token
        const sessionId = encodeHexLowerCase(
          sha256(new TextEncoder().encode(token))
        );
        const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);
        const session = await this._sessionRepository.createSession(
          {
            id: sessionId,
            userId: user.id,
            expiresAt: expiresAt,
          },
          tx
        );

        const cookie = this.buildSessionCookie(token, expiresAt);

        return { session, cookie };
      }
    );
  }

  buildSessionCookie(token: string, expiresAt: Date): Cookie {
    return {
      name: SESSION_COOKIE,
      value: token,
      attributes: {
        path: '/',
        expires: expiresAt,
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
    };
  }

  async invalidateSession(token: string): Promise<{ blankCookie: Cookie }> {
    return await this._instrumentationService.startSpan(
      {
        name: 'AuthenticationService > invalidateSession',
      },
      async () => {
        const sessionId = encodeHexLowerCase(
          sha256(new TextEncoder().encode(token))
        );
        await this._sessionRepository.deleteSession(sessionId);
        const blankCookie: Cookie = {
          name: SESSION_COOKIE,
          value: '',
          attributes: {},
        };

        return { blankCookie };
      }
    );
  }

  generateUserId(): string {
    return this._instrumentationService.startSpan(
      { name: 'AuthenticationService > generateUserId', op: 'function' },
      () => generateIdFromEntropySize(10)
    );
  }
}
