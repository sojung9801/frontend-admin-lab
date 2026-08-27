import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "./features/auth/model/sessionCookie";
import { isLocale } from "./i18n/locale";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

function getRoutePath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const hasLocale = isLocale(segments[0]);

  return {
    locale: hasLocale ? segments[0] : null,
    pathname: `/${segments.slice(hasLocale ? 1 : 0).join("/")}`,
  };
}

export default function proxy(request: NextRequest) {
  const route = getRoutePath(request.nextUrl.pathname);
  const isAdminRoute =
    route.pathname === "/admin" || route.pathname.startsWith("/admin/");
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);

  if (isAdminRoute && !hasSession) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = route.locale ? `/${route.locale}/login` : "/login";
    loginUrl.search = "";

    return NextResponse.redirect(loginUrl);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
