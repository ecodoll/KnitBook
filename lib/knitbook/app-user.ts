import type { AppHeaderUser } from "@/components/knitbook/layout/AppHeader";
import { createClient } from "@/lib/supabase/server";

type UserProfileRow = {
  nickname: string | null;
  email: string | null;
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
 * 로그인한 사용자의 헤더 표시 정보를 불러온다.
 */
const getAppHeaderUser = async (): Promise<AppHeaderUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    if (authError && process.env.NODE_ENV === "development") {
      console.error("[사용자 인증 조회 실패]", authError.message);
    }
    return null;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("nickname, email")
    .eq("id", user.id)
    .maybeSingle();

  const resolved = (profile as UserProfileRow | null) ?? null;

  return {
    nickname: resolveNickname(resolved, user),
    email: resolved?.email ?? user.email ?? undefined,
  };
};

export { getAppHeaderUser };
