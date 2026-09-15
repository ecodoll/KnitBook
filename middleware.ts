import { NextResponse, type NextRequest } from "next/server";
import { isAuthPath } from "@/lib/supabase/auth-routes";
import { isProtectedPath } from "@/lib/knitbook/public-routes";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Supabase 세션 쿠키를 다른 응답에 그대로 옮긴다.
 */
const copySessionCookies = (from: NextResponse, to: NextResponse) => {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
  return to;
};

/**
 * 비로그인 홈을 공개 랜딩(/welcome)으로 내부 연결한다. 주소는 / 로 유지한다.
 */
const rewriteGuestHome = (request: NextRequest, from?: NextResponse) => {
  const url = request.nextUrl.clone();
  url.pathname = "/welcome";
  const rewritten = NextResponse.rewrite(url);

  return from ? copySessionCookies(from, rewritten) : rewritten;
};

/**
 * 로그인 화면으로 보낸다.
 */
const redirectToLogin = (request: NextRequest, from?: NextResponse) => {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  const redirected = NextResponse.redirect(url);

  return from ? copySessionCookies(from, redirected) : redirected;
};

/**
 * Supabase 공개 키가 준비됐는지 확인한다.
 */
const hasSupabaseConfig = () => {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

/**
 * KnitBook 요청 미들웨어 진입점이다.
 */
const middleware = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  const onAuthPage = isAuthPath(pathname);

  if (!hasSupabaseConfig()) {
    if (pathname === "/") {
      return rewriteGuestHome(request);
    }

    if (isProtectedPath(pathname)) {
      return redirectToLogin(request);
    }

    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  // 비로그인 기본 화면은 공개 랜딩이다. 주소는 / 로 두고 본문만 /welcome 을 쓴다.
  if (!user && pathname === "/") {
    return rewriteGuestHome(request, supabaseResponse);
  }

  // 기록장·도안·실 같은 보호 경로는 로그인 화면으로 보낸다.
  if (!user && isProtectedPath(pathname)) {
    return redirectToLogin(request, supabaseResponse);
  }

  // 로그인된 사용자는 인증 페이지 접근 시 메인으로 보낸다.
  if (user && onAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return copySessionCookies(supabaseResponse, NextResponse.redirect(url));
  }

  return supabaseResponse;
};

export default middleware;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
