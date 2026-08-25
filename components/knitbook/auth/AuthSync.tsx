"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AUTH_PATHS } from "@/lib/supabase/auth-routes";

/**
 * 현재 경로가 인증 페이지인지 판별한다.
 */
const isAuthPagePath = (pathname: string) => {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
};

/**
 * Supabase 인증 상태 변화를 구독하고 라우팅을 동기화한다.
 * 경로가 바뀔 때마다 구독을 다시 걸지 않아 불필요한 RSC 새로고침을 막는다.
 */
const AuthSync = () => {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentPath = window.location.pathname;
      const onAuthPage = isAuthPagePath(currentPath);
      const isSignedIn = Boolean(session?.user);

      if (process.env.NODE_ENV === "development") {
        console.info("[AuthSync]", event, {
          pathname: currentPath,
          isSignedIn,
        });
      }

      // 로그인 직후 이동은 LoginScreen에서 처리한다. (이중 replace·쿠키 레이스 방지)
      if (
        event === "INITIAL_SESSION" ||
        event === "TOKEN_REFRESHED" ||
        event === "SIGNED_IN"
      ) {
        return;
      }

      if (!isSignedIn && !onAuthPage && event === "SIGNED_OUT") {
        router.replace("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
};

export default AuthSync;
