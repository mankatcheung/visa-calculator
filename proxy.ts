import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { SESSION_COOKIE } from './config';
import { getInjection } from './di/container';

type localeType = 'en' | 'zh-Hant-HK';

const AUTH_PATHS = ['sign-in', 'sign-up', 'forgot-password', 'reset-password', 'verify-email'];

export default async function proxy(request: NextRequest) {
  // Step 1: Use the incoming request (example)
  const defaultLocale = request.headers.get('x-your-custom-locale') || 'en';

  // Step 2: Create and call the next-intl middleware (example)
  const handleI18nRouting = createMiddleware({
    locales: ['en', 'zh-Hant-HK'],
    defaultLocale: defaultLocale as localeType,
  });
  const response = handleI18nRouting(request);

  // Step 3: Alter the response (example)
  response.headers.set('x-your-custom-locale', defaultLocale);

  const [, , ...segments] = request.nextUrl.pathname.split('/');
  const isAuthPath = segments?.[0] ? AUTH_PATHS.includes(segments?.[0]) : false;

  if (!isAuthPath) {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      return NextResponse.redirect(
        new URL(`/${defaultLocale}/sign-in`, request.url)
      );
    }
    try {
      const authenticationService = getInjection('IAuthenticationService');
      const { session, user } =
        await authenticationService.validateSession(sessionId);
      const cookie = authenticationService.buildSessionCookie(
        sessionId,
        session.expiresAt
      );
      response.cookies.set(cookie.name, cookie.value, cookie.attributes);
      if (!user.emailVerified) {
        return NextResponse.redirect(
          new URL(`/${defaultLocale}/verify-email`, request.url)
        );
      }
    } catch {
      return NextResponse.redirect(
        new URL(`/${defaultLocale}/sign-in`, request.url)
      );
    }
  }
  return response;
}

export const config = {
  // Match only internationalized pathnames. Anything with a file extension
  // (favicon.ico, manifest.webmanifest, sw.js, sitemap.xml, robots.txt) is
  // treated as a static/metadata asset and skipped. `icon`/`apple-icon` are
  // listed explicitly because Next's dynamic icon routes are served without
  // an extension.
  matcher: ['/((?!api|_next/static|_next/image|icon|apple-icon|.*\\..*).*)'],
};
