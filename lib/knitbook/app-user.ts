import { cache } from "react";
import { after } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { AppHeaderUser } from "@/components/knitbook/layout/AppHeader";
import { createClient } from "@/lib/supabase/server";

type UserProfileRow = {
  nickname: string | null;
  email: string | null;
};

type SupabaseLikeError = {
  code?: string;
  message?: string;
};

/**
 * JWT 발급 시각이 서버보다 앞선(시계 오차) 오류인지 판별한다.
 */
const isJwtIssuedAtFutureError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const typed = error as SupabaseLikeError;
  return (
    typed.code === "PGRST303" ||
    (typed.message ?? "").toLowerCase().includes("jwt issued at future")
  );
};

/**
 * Auth 사용자 메타데이터에서 표시용 닉네임을 고른다.
 */
const resolveNickname = (
  profile: UserProfileRow | null,
  authUser: {
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  }
) => {
  const fromProfile = profile?.nickname?.trim();
  if (fromProfile) {
    return fromProfile;
  }

  const fromMeta = authUser.user_metadata?.nickname;
  if (typeof fromMeta === "string" && fromMeta.trim()) {
    return fromMeta.trim();
  }

  const email = profile?.email ?? authUser.email ?? "";
  if (email.includes("@")) {
    return email.split("@")[0] || "뜨개인";
  }

  return "뜨개인";
};

/**
 * 요청 단위로 인증 사용자를 조회한다.
 */
const getAuthUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[사용자 인증 조회 실패]", authError.message);
    }
    return null;
  }

  return user;
});

/**
 * 로그인한 사용자의 헤더 표시 정보를 불러온다.
 */
const getAppHeaderUser = cache(async (): Promise<AppHeaderUser | null> => {
  const user = await getAuthUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("nickname, email")
    .eq("id", user.id)
    .maybeSingle();

  let resolved = (profile as UserProfileRow | null) ?? null;

  if (profileError) {
    if (isJwtIssuedAtFutureError(profileError)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[프로필 조회] JWT 시계 오차로 Auth 메타데이터를 사용합니다.",
          profileError.message
        );
      }
    } else if (process.env.NODE_ENV === "development") {
      console.error("[프로필 조회 실패]", profileError.message);
    }
  }

  // 프로필이 없으면 Auth 메타로 즉시 응답하고, DB 생성은 응답 이후에 한다.
  if (!resolved && !profileError) {
    const nickname = resolveNickname(null, user);
    resolved = { nickname, email: user.email ?? null };

    after(async () => {
      const { error: upsertError } = await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email,
          nickname,
        },
        { onConflict: "id" }
      );

      if (upsertError && process.env.NODE_ENV === "development") {
        if (isJwtIssuedAtFutureError(upsertError)) {
          console.warn(
            "[프로필 생성] JWT 시계 오차로 DB 저장을 건너뜁니다.",
            upsertError.message
          );
        } else {
          console.error("[프로필 생성 실패]", upsertError.message);
        }
      }
    });
  }

  if (!resolved) {
    resolved = {
      nickname: resolveNickname(null, user),
      email: user.email ?? null,
    };
  }

  return {
    nickname: resolveNickname(resolved, user),
    email: resolved.email ?? user.email ?? undefined,
  };
});

export { getAuthUser, getAppHeaderUser };
