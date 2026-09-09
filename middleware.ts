import { NextResponse, type NextRequest } from "next/server";
import { isAuthPath } from "@/lib/supabase/auth-routes";
import { isProtectedPath } from "@/lib/knitbook/public-routes";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Supabase 세션 쿠키를 다른 응답에 그대로 옮긴다.
 */
const copySessionCookies = (
  from: NextResponse,
  to: NextResponse
) => {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
  return to;
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
    if (pathname === "/" || isProtectedPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  // 비로그인 기본 화면은 로그인이다. 가이드는 로그인 화면 버튼으로 연다.
  if (!user && (pathname === "/" || isProtectedPath(pathname))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return copySessionCookies(supabaseResponse, NextResponse.redirect(url));
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
