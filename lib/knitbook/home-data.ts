import { cache } from "react";
import type {
  Pattern,
  PatternDifficulty,
  Project,
  ProjectStatus,
  Yarn,
  YarnInventorySummary,
} from "@/components/knitbook/types";
import type { AppHeaderUser } from "@/components/knitbook/layout/AppHeader";
import { getAppHeaderUser, getAuthUser } from "@/lib/knitbook/app-user";
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

type PatternRow = {
  id: string;
  title: string;
  designer: string | null;
  cover_image_url: string | null;
  difficulty: number | null;
  category: string | null;
  tags: string[] | null;
  favorite: boolean | null;
  last_opened_at: string | null;
  created_at: string;
};

type YarnRow = {
  id: string;
  brand: string;
  product_name: string;
  color_name: string | null;
  color_code: string | null;
  lot_number: string | null;
  material: string | null;
  weight_gram: number | string | null;
  remaining_weight: number | string | null;
  quantity: number | string | null;
  thickness: string | null;
  recommended_needle: string | null;
  yarn_image_url: string | null;
  is_in_use: boolean | null;
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

const LOW_STOCK_GRAMS = 100;

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
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    coverImageUrl: row.cover_image_url ?? undefined,
    progressPercent: toNumber(row.progress_percent) ?? 0,
    currentRow: row.current_row ?? undefined,
    totalRows: row.total_row ?? undefined,
    lastWorkedAt: latestLog?.created_at ?? row.updated_at,
    lastNote: latestLog?.memo ?? row.notes ?? undefined,
    patternId: row.pattern_id ?? undefined,
  };
};

/**
 * DB 도안 행을 UI Pattern 타입으로 변환한다.
 */
const mapPattern = (row: PatternRow): Pattern => {
  const difficulty =
    row.difficulty === 1 ||
    row.difficulty === 2 ||
    row.difficulty === 3 ||
    row.difficulty === 4 ||
    row.difficulty === 5
      ? (row.difficulty as PatternDifficulty)
      : undefined;

  return {
    id: row.id,
    title: row.title,
    designer: row.designer ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    difficulty,
    category: row.category ?? undefined,
    tags: row.tags ?? undefined,
    isFavorite: row.favorite ?? false,
    lastOpenedAt: row.last_opened_at ?? undefined,
    createdAt: row.created_at,
  };
};

/**
 * DB 실 행을 UI Yarn 타입으로 변환한다.
 */
const mapYarn = (row: YarnRow): Yarn => {
  return {
    id: row.id,
    brand: row.brand,
    productName: row.product_name,
    colorName: row.color_name ?? undefined,
    colorCode: row.color_code ?? undefined,
    lotNumber: row.lot_number ?? undefined,
    fiber: row.material ?? undefined,
    weightGrams: toNumber(row.weight_gram),
    remainingGrams: toNumber(row.remaining_weight),
    quantity: toNumber(row.quantity),
    yarnWeight: row.thickness ?? undefined,
    needleSizeMm: row.recommended_needle ?? undefined,
    imageUrl: row.yarn_image_url ?? undefined,
    isInUse: row.is_in_use ?? false,
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

  const headerUser = await getAppHeaderUser();
  if (!headerUser) {
    return null;
  }

  const supabase = await createClient();
  const [
    { data: projectRows, error: projectsError },
    { data: patternRows, error: patternsError },
    { data: yarnRows, error: yarnsError },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, title, status, progress_percent, current_row, total_row, cover_image_url, pattern_id, notes, updated_at"
      )
      .eq("user_id", user.id)
      .eq("status", "in_progress")
      .order("updated_at", { ascending: false }),
    supabase
      .from("patterns")
      .select(
        "id, title, designer, cover_image_url, difficulty, category, tags, favorite, last_opened_at, created_at"
      )
      .eq("user_id", user.id)
      .order("last_opened_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("yarns")
      .select(
        "id, brand, product_name, color_name, color_code, remaining_weight, quantity, yarn_image_url, is_in_use"
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

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

  const projects = typedProjects.map((row) =>
    mapProject(row, latestLogsByProject.get(row.id) ?? null)
  );

  const patterns = ((patternRows ?? []) as PatternRow[]).map(mapPattern);
  const yarns = ((yarnRows ?? []) as YarnRow[]).map(mapYarn);

  const totalRemainingGrams = yarns.reduce((sum, yarn) => {
    return sum + (yarn.remainingGrams ?? 0);
  }, 0);

  const lowStockCount = yarns.filter((yarn) => {
    if (typeof yarn.remainingGrams === "number") {
      return yarn.remainingGrams < LOW_STOCK_GRAMS;
    }
    return (yarn.quantity ?? 0) <= 0;
  }).length;

  const yarnSummary: YarnInventorySummary = {
    totalKinds: yarns.length,
    totalRemainingGrams: yarns.length > 0 ? totalRemainingGrams : undefined,
    lowStockCount,
    recentYarns: yarns.slice(0, 3),
  };

  return {
    user: headerUser,
    projects,
    patterns,
    yarnSummary,
  };
});

export { getHomeDashboardData };
