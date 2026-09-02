import { cache } from "react";
import type {
  Pattern,
  Project,
  ProjectStatus,
  YarnInventorySummary,
} from "@/components/knitbook/types";
import type { AppHeaderUser } from "@/components/knitbook/layout/AppHeader";
import { getAppHeaderUser, getAuthUser } from "@/lib/knitbook/app-user";
import {
  mapPattern,
  type PatternRow,
} from "@/lib/knitbook/patterns/map-pattern";
import { isHttpUrl } from "@/lib/knitbook/patterns/signed-url";
import { attachSignedProjectCovers } from "@/lib/knitbook/projects/signed-url";
import {
  HOME_PATTERN_VISIBLE_LIMIT,
  HOME_PROJECT_VISIBLE_LIMIT,
  HOME_YARN_THUMB_LIMIT,
} from "@/components/knitbook/home/constants";
import { LOW_STOCK_GRAMS, YARN_SELECT } from "@/lib/knitbook/yarns/constants";
import { mapYarn, type YarnRow } from "@/lib/knitbook/yarns/map-yarn";
import { createSignedYarnImageUrls } from "@/lib/knitbook/yarns/signed-url";
import { createClient } from "@/lib/supabase/server";

type ProjectRow = {
  id: string;
  title: string;
  status: ProjectStatus;
  progress_percent: number | string | null;
  current_row: number | null;
  total_row: number | null;
  cover_image_url: string | null;
  pattern_id: string | null;
  notes: string | null;
  updated_at: string;
};

type ProjectLogRow = {
  project_id: string;
  logged_on: string;
  memo: string | null;
  created_at: string;
};

export type HomeDashboardData = {
  user: AppHeaderUser;
  projects: Project[];
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
 * 숫자형 DB 값을 number로 안전하게 변환한다.
 */
const toNumber = (value: number | string | null | undefined) => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

/**
 * DB 작품 행을 UI Project 타입으로 변환한다.
 */
const mapProject = (
  row: ProjectRow,
  latestLog?: ProjectLogRow | null
): Project => {
  const coverRaw = row.cover_image_url;

  return {
    id: row.id,
    title: row.title,
    status: row.status,
    coverImageUrl: isHttpUrl(coverRaw) ? coverRaw : undefined,
    coverImageStoragePath:
      coverRaw && !isHttpUrl(coverRaw) ? coverRaw : undefined,
    progressPercent: toNumber(row.progress_percent) ?? 0,
    currentRow: row.current_row ?? undefined,
    totalRows: row.total_row ?? undefined,
    lastWorkedAt: latestLog?.created_at ?? row.updated_at,
    lastNote: latestLog?.memo ?? row.notes ?? undefined,
    patternId: row.pattern_id ?? undefined,
  };
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
    { data: projectRows, error: projectsError },
    { data: patternRows, error: patternsError },
    { data: yarnRows, error: yarnsError },
  ] = await Promise.all([
    getAppHeaderUser(),
    supabase
      .from("projects")
      .select(
        "id, title, status, progress_percent, current_row, total_row, cover_image_url, pattern_id, notes, updated_at"
      )
      .eq("user_id", user.id)
      .eq("status", "in_progress")
      .order("updated_at", { ascending: false })
      .limit(HOME_PROJECT_VISIBLE_LIMIT + 1),
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

  if (projectsError && process.env.NODE_ENV === "development") {
    console.error("[작품 조회 실패]", formatSupabaseError(projectsError));
  }
  if (patternsError && process.env.NODE_ENV === "development") {
    console.error("[도안 조회 실패]", formatSupabaseError(patternsError));
  }
  if (yarnsError && process.env.NODE_ENV === "development") {
    console.error("[실 조회 실패]", formatSupabaseError(yarnsError));
  }

  const typedProjects = (projectRows ?? []) as ProjectRow[];
  const projectIds = typedProjects.map((project) => project.id);

  const latestLogsByProject = new Map<string, ProjectLogRow>();
  if (projectIds.length > 0) {
    const { data: logRows, error: logsError } = await supabase
      .from("project_logs")
      .select("project_id, logged_on, memo, created_at")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false })
      .limit(Math.max(projectIds.length * 8, 24));

    if (logsError && process.env.NODE_ENV === "development") {
      console.error("[작업 기록 조회 실패]", formatSupabaseError(logsError));
    }

    for (const log of (logRows ?? []) as ProjectLogRow[]) {
      if (!latestLogsByProject.has(log.project_id)) {
        latestLogsByProject.set(log.project_id, log);
      }
    }
  }

  const projects = await attachSignedProjectCovers(
    supabase,
    typedProjects.map((row) =>
      mapProject(row, latestLogsByProject.get(row.id) ?? null)
    )
  );

  // 표지 서명은 카드(PatternCover)에서 처리해 홈 전환을 막지 않는다.
  const patterns = ((patternRows ?? []) as PatternRow[]).map((row) =>
    mapPattern(row)
  );
  const yarns = ((yarnRows ?? []) as YarnRow[]).map((row) => mapYarn(row));
  const recentYarnsRaw = yarns.slice(0, RECENT_YARN_LIMIT);
  const recentYarnSignedUrls = await createSignedYarnImageUrls(
    supabase,
    recentYarnsRaw.map((yarn) => yarn.imageStoragePath ?? yarn.imageUrl)
  );
  const recentYarns = recentYarnsRaw.map((yarn, index) => ({
    ...yarn,
    imageUrl: recentYarnSignedUrls[index] ?? yarn.imageUrl,
  }));

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
    patterns,
    yarnSummary,
  };
});

export { getHomeDashboardData };
