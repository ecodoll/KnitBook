import { NextResponse, type NextRequest } from "next/server";
import { isAuthPath } from "@/lib/supabase/auth-routes";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * KnitBook 요청 미들웨어 진입점이다.
 */
const middleware = async (request: NextRequest) => {
  const { supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;
  const onAuthPage = isAuthPath(pathname);

  // 비로그인 사용자는 보호된 페이지 접근 시 로그인으로 보낸다.
  if (!user && !onAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 로그인된 사용자는 인증 페이지 접근 시 메인으로 보낸다.
  if (user && onAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
};

export default middleware;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
