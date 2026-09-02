import type {
  Project,
  ProjectStatus,
  ProjectYarnLink,
  WorkLog,
} from "@/components/knitbook/types";
import { isHttpUrl } from "@/lib/knitbook/patterns/signed-url";
import { toNumber } from "@/lib/knitbook/yarns/map-yarn";

export type ProjectRow = {
  id: string;
  pattern_id?: string | null;
  title: string;
  status: ProjectStatus;
  progress_percent?: number | string | null;
  current_row?: number | null;
  total_row?: number | null;
  size?: string | null;
  started_at?: string | null;
  target_date?: string | null;
  completed_at?: string | null;
  cover_image_url?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  patterns?: { id?: string; title?: string | null } | null;
  project_yarns?: ProjectYarnJoinRow[] | null;
};

export type ProjectYarnJoinRow = {
  id: string;
  yarn_id: string;
  planned_quantity?: number | string | null;
  used_quantity?: number | string | null;
  yarns?: {
    id?: string;
    brand?: string;
    product_name?: string;
    color_name?: string | null;
    remaining_weight?: number | string | null;
  } | null;
};

export type ProjectLogRow = {
  id: string;
  project_id: string;
  logged_on: string;
  row_count?: number | null;
  progress_percent?: number | string | null;
  work_minutes?: number | null;
  photo_url?: string | null;
  memo?: string | null;
  created_at: string;
};

/**
 * 연결된 실 조인 행을 UI 타입으로 변환한다.
 */
const mapProjectYarn = (row: ProjectYarnJoinRow): ProjectYarnLink => {
  const yarn = row.yarns;
  return {
    id: row.id,
    yarnId: yarn?.id ?? row.yarn_id,
    brand: yarn?.brand ?? "실",
    productName: yarn?.product_name ?? "",
    colorName: yarn?.color_name ?? undefined,
    plannedQuantity: toNumber(row.planned_quantity),
    usedQuantity: toNumber(row.used_quantity),
    remainingGrams: toNumber(yarn?.remaining_weight),
  };
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
    lastNote: latestLog?.memo ?? undefined,
    patternId: row.pattern_id ?? row.patterns?.id ?? undefined,
    patternTitle: row.patterns?.title ?? undefined,
    size: row.size ?? undefined,
    startedAt: row.started_at ?? undefined,
    targetDate: row.target_date ?? undefined,
    completedAt: row.completed_at ?? undefined,
    notes: row.notes ?? undefined,
    yarns: (row.project_yarns ?? []).map(mapProjectYarn),
  };
};

/**
 * DB 작업 기록 행을 UI WorkLog 타입으로 변환한다.
 */
const mapWorkLog = (row: ProjectLogRow): WorkLog => {
  return {
    id: row.id,
    projectId: row.project_id,
    date: row.logged_on,
    currentRow: row.row_count ?? undefined,
    progressPercent: toNumber(row.progress_percent),
    durationMinutes: row.work_minutes ?? undefined,
    memo: row.memo ?? undefined,
    photoUrl: row.photo_url ?? undefined,
  };
};

export { mapProject, mapProjectYarn, mapWorkLog };
