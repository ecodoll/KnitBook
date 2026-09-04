import { cache } from "react";
import type { AppHeaderUser } from "@/components/knitbook/layout/AppHeader";
import { createClient } from "@/lib/supabase/server";

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

/**
 * JWT 클레임에서 닉네임으로 쓸 값을 고른다.
 */
const nicknameFromMetadata = (metadata: unknown) => {
  if (!metadata || typeof metadata !== "object") {
    return undefined;
  }

  const nickname = (metadata as Record<string, unknown>).nickname;
  if (typeof nickname === "string" && nickname.trim()) {
    return nickname.trim();
  }

  return undefined;
};

/**
 * Auth 사용자 메타데이터에서 표시용 닉네임을 고른다.
 */
const resolveNickname = (authUser: AuthUser) => {
  const fromMeta = nicknameFromMetadata(authUser.user_metadata);
  if (fromMeta) {
    return fromMeta;
  }

  const email = authUser.email ?? "";
  if (email.includes("@")) {
    return email.split("@")[0] || "뜨개인";
  }

  return "뜨개인";
};

/**
 * JWT 클레임을 앱에서 쓰는 인증 사용자 형태로 바꾼다.
 */
const claimsToAuthUser = (claims: Record<string, unknown> | null | undefined) => {
  const id = claims?.sub;
  if (typeof id !== "string" || !id) {
    return null;
  }

  const email = claims?.email;
  const userMetadata = claims?.user_metadata;

  return {
    id,
    email: typeof email === "string" ? email : null,
    user_metadata:
      userMetadata && typeof userMetadata === "object"
        ? (userMetadata as Record<string, unknown>)
        : {},
  } satisfies AuthUser;
};

/**
 * 요청 단위로 인증 사용자를 조회한다.
 * getClaims()는 JWT를 로컬 검증해 getUser()보다 화면 전환이 빠르다.
 */
const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[사용자 인증 조회 실패]", error.message);
    }
    return null;
  }

  return claimsToAuthUser(data?.claims as Record<string, unknown> | undefined);
});

/**
 * 로그인한 사용자의 헤더 표시 정보를 JWT에서 바로 만든다.
 * 프로필 DB 조회를 기다리지 않아 레이아웃 전환을 막지 않는다.
 */
const getAppHeaderUser = cache(async (): Promise<AppHeaderUser | null> => {
  const user = await getAuthUser();
  if (!user) {
    return null;
  }

  return {
    nickname: resolveNickname(user),
    email: user.email ?? undefined,
  };
});

export { getAuthUser, getAppHeaderUser };
