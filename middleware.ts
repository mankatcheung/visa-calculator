import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "./config";
import { getInjection } from "./di/container";

type localeType = "en" | "zh-Hant-HK";

const AUTH_PATHS = ["sign-in", "sign-up"];

export default async function middleware(request: NextRequest) {
  // Step 1: Use the incoming request (example)
  const defaultLocale = request.headers.get("x-your-custom-locale") || "en";

  // Step 2: Create and call the next-intl middleware (example)
  const handleI18nRouting = createMiddleware({
    locales: ["en", "zh-Hant-HK"],
    defaultLocale: defaultLocale as localeType,
  });
  const response = handleI18nRouting(request);

  // Step 3: Alter the response (example)
  response.headers.set("x-your-custom-locale", defaultLocale);

  const [, locale, ...segments] = request.nextUrl.pathname.split("/");
  const isAuthPath = AUTH_PATHS.includes(segments?.[0]);

  if (!isAuthPath) {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      return NextResponse.redirect(
        new URL(`/${defaultLocale}/sign-in`, request.url),
      );
    }
    try {
      const authenticationService = getInjection("IAuthenticationService");
      await authenticationService.validateSession(sessionId);
    } catch (err) {
      return NextResponse.redirect(
        new URL(`/${defaultLocale}/sign-in`, request.url),
      );
    }
  }
  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
