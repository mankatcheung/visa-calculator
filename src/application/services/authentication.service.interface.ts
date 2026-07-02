import { Cookie } from '@/src/entities/models/cookie';
import { Session } from '@/src/entities/models/session';
import type { ITransaction } from '@/src/entities/models/transaction.interface';
import { User } from '@/src/entities/models/user';

export interface IAuthenticationService {
  generateUserId(): string;
  validateSession(token: string): Promise<{ user: User; session: Session }>;
  validatePasswords(
    inputPassword: string,
    usersHashedPassword: string
  ): Promise<boolean>;
  createSession(
    user: User,
    tx?: ITransaction
  ): Promise<{ session: Session; cookie: Cookie }>;
  buildSessionCookie(token: string, expiresAt: Date): Cookie;
  invalidateSession(token: string): Promise<{ blankCookie: Cookie }>;
}
