"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AUTH_PATHS } from "@/lib/supabase/auth-routes";

/**
 * Supabase 인증 상태 변화를 구독하고 라우팅을 동기화한다.
 */
const AuthSync = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));
      const isSignedIn = Boolean(session?.user);

      if (process.env.NODE_ENV === "development") {
        console.info("[AuthSync]", event, { pathname, isSignedIn });
      }

      if (isSignedIn && isAuthPage) {
        router.replace("/");
        router.refresh();
        return;
      }

      if (!isSignedIn && !isAuthPage) {
        router.replace("/login");
        router.refresh();
        return;
      }

      if (
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED" ||
        event === "INITIAL_SESSION"
      ) {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  return null;
};

export default AuthSync;
