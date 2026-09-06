import { cache } from "react";
import type {
  Pattern,
  Project,
  YarnInventorySummary,
} from "@/components/knitbook/types";
import type { AppHeaderUser } from "@/components/knitbook/layout/AppHeader";
import { getAppHeaderUser, getAuthUser } from "@/lib/knitbook/app-user";
import {
  mapPattern,
  type PatternRow,
} from "@/lib/knitbook/patterns/map-pattern";
import {
  HOME_PATTERN_VISIBLE_LIMIT,
  HOME_PROJECT_VISIBLE_LIMIT,
  HOME_YARN_THUMB_LIMIT,
  sortProjectsByLatestWork,
} from "@/components/knitbook/home/constants";
import { getProjectsPageData } from "@/lib/knitbook/project-data";
import { LOW_STOCK_GRAMS, YARN_SELECT } from "@/lib/knitbook/yarns/constants";
import { mapYarn, type YarnRow } from "@/lib/knitbook/yarns/map-yarn";
import { createClient } from "@/lib/supabase/server";

export type HomeDashboardData = {
  user: AppHeaderUser;
  projects: Project[];
  projectsError: string | null;
  patterns: Pattern[];
  yarnSummary: YarnInventorySummary;
};

const RECENT_YARN_LIMIT = HOME_YARN_THUMB_LIMIT;

type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

/**
 * Supabase 오류를 문자열로 직렬화한다. (Issues 패널의 빈 {} 방지)
 */
const formatSupabaseError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return String(error);
  }

  const typed = error as SupabaseLikeError;
  return [
    typed.code ? `code=${typed.code}` : null,
    typed.message ? `message=${typed.message}` : null,
    typed.details ? `details=${typed.details}` : null,
    typed.hint ? `hint=${typed.hint}` : null,
  ]
    .filter(Boolean)
    .join(", ");
};

/**
 * 작품 탭과 같은 목록을 읽어 홈용 최근 3개로 줄인다.
 */
const loadHomeProjects = async (): Promise<{
  projects: Project[];
  errorMessage: string | null;
}> => {
  try {
    const data = await getProjectsPageData();
    return {
      projects: sortProjectsByLatestWork(data?.projects ?? []).slice(
        0,
        HOME_PROJECT_VISIBLE_LIMIT
      ),
      errorMessage: null,
    };
  } catch (error) {
    console.error("[홈 작품 조회 실패]", error);
    return {
      projects: [],
      errorMessage: "작품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
};

/**
 * 로그인한 사용자의 홈 대시보드 데이터를 불러온다.
 */
const getHomeDashboardData = cache(async (): Promise<HomeDashboardData | null> => {
  const user = await getAuthUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();

  // 헤더 프로필과 홈 본문 데이터를 병렬로 가져온다.
  const [
    headerUser,
    projectResult,
    { data: patternRows, error: patternsError },
    { data: yarnRows, error: yarnsError },
  ] = await Promise.all([
    getAppHeaderUser(),
    loadHomeProjects(),
    supabase
      .from("patterns")
      .select(
        "id, title, designer, cover_image_url, pdf_url, difficulty, category, tags, favorite, notes, source, last_opened_at, created_at"
      )
      .eq("user_id", user.id)
      .order("last_opened_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(HOME_PATTERN_VISIBLE_LIMIT),
    supabase
      .from("yarns")
      .select(YARN_SELECT)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  if (!headerUser) {
    return null;
  }

  if (patternsError && process.env.NODE_ENV === "development") {
    console.error("[도안 조회 실패]", formatSupabaseError(patternsError));
  }
  if (yarnsError && process.env.NODE_ENV === "development") {
    console.error("[실 조회 실패]", formatSupabaseError(yarnsError));
  }

  const projects = projectResult.projects;
  const projectsError = projectResult.errorMessage;

  // 표지·실 사진 서명은 카드에서 처리해 홈 전환을 막지 않는다.
  const patterns = ((patternRows ?? []) as PatternRow[]).map((row) =>
    mapPattern(row)
  );
  const yarns = ((yarnRows ?? []) as YarnRow[]).map((row) => mapYarn(row));
  const recentYarns = yarns.slice(0, RECENT_YARN_LIMIT);

  const totalRemainingGrams = yarns.reduce((sum, yarn) => {
    return sum + (yarn.remainingGrams ?? 0);
  }, 0);

  const lowStockCount = yarns.filter((yarn) => {
    return (
      typeof yarn.remainingGrams === "number" &&
      yarn.remainingGrams < LOW_STOCK_GRAMS
    );
  }).length;

  const yarnSummary: YarnInventorySummary = {
    totalKinds: yarns.length,
    totalRemainingGrams: yarns.length > 0 ? totalRemainingGrams : undefined,
    lowStockCount,
    recentYarns,
  };

  return {
    user: headerUser,
    projects,
    projectsError,
    patterns,
    yarnSummary,
  };
});

export { getHomeDashboardData };
