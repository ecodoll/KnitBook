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
  gauge_stitches?: number | string | null;
  gauge_rows?: number | string | null;
  created_at?: string;
  updated_at?: string;
  patterns?: PatternJoinRow | PatternJoinRow[] | null;
  project_yarns?: ProjectYarnJoinRow[] | null;
};

export type PatternJoinRow = {
  id?: string;
  title?: string | null;
  cover_image_url?: string | null;
  pdf_url?: string | null;
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
 * 작업 기록에 표시할 사진이 있는지 확인한다.
 */
const hasLogPhoto = (log: Pick<ProjectLogRow, "photo_url">) => {
  return Boolean(log.photo_url && log.photo_url.trim());
};

/**
 * 최신 기록과 사진이 있는 가장 최근 기록을 작품별로 고른다.
 */
const pickLatestLogs = (logs: ProjectLogRow[]) => {
  const latestByProject = new Map<string, ProjectLogRow>();
  const latestPhotoByProject = new Map<string, ProjectLogRow>();

  for (const log of logs) {
    if (!latestByProject.has(log.project_id)) {
      latestByProject.set(log.project_id, log);
    }
    if (hasLogPhoto(log) && !latestPhotoByProject.has(log.project_id)) {
      latestPhotoByProject.set(log.project_id, log);
    }
  }

  return { latestByProject, latestPhotoByProject };
};

/**
 * 도안 조인 값을 한 행으로 정규화한다.
 */
const normalizePatternJoin = (value: ProjectRow["patterns"]) => {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? value[0] ?? null : value;
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
  latestLog?: ProjectLogRow | null,
  latestPhotoLog?: ProjectLogRow | null
): Project => {
  const photoRaw = latestPhotoLog?.photo_url;
  const pattern = normalizePatternJoin(row.patterns);
  const patternCoverRaw = pattern?.cover_image_url;

  return {
    id: row.id,
    title: row.title,
    status: row.status,
    coverImageUrl: isHttpUrl(photoRaw) ? photoRaw : undefined,
    coverImageStoragePath:
      photoRaw && !isHttpUrl(photoRaw) ? photoRaw : undefined,
    patternCoverImageUrl: isHttpUrl(patternCoverRaw) ? patternCoverRaw : undefined,
    patternCoverStoragePath:
      patternCoverRaw && !isHttpUrl(patternCoverRaw) ? patternCoverRaw : undefined,
    patternPdfStoragePath: pattern?.pdf_url ?? undefined,
    progressPercent: toNumber(row.progress_percent) ?? 0,
    currentRow: row.current_row ?? undefined,
    totalRows: row.total_row ?? undefined,
    lastWorkedAt: latestLog?.created_at ?? row.updated_at,
    lastNote: latestLog?.memo ?? undefined,
    patternId: row.pattern_id ?? pattern?.id ?? undefined,
    patternTitle: pattern?.title ?? undefined,
    size: row.size ?? undefined,
    startedAt: row.started_at ?? undefined,
    targetDate: row.target_date ?? undefined,
    completedAt: row.completed_at ?? undefined,
    notes: row.notes ?? undefined,
    gaugeStitches: toNumber(row.gauge_stitches),
    gaugeRows: toNumber(row.gauge_rows),
    yarns: (row.project_yarns ?? []).map(mapProjectYarn),
  };
};

/**
 * DB 작업 기록 행을 UI WorkLog 타입으로 변환한다.
 */
const mapWorkLog = (row: ProjectLogRow): WorkLog => {
  const photoRaw = row.photo_url;

  return {
    id: row.id,
    projectId: row.project_id,
    date: row.logged_on,
    currentRow: row.row_count ?? undefined,
    progressPercent: toNumber(row.progress_percent),
    durationMinutes: row.work_minutes ?? undefined,
    memo: row.memo ?? undefined,
    photoUrl: isHttpUrl(photoRaw) ? photoRaw : undefined,
    photoStoragePath: photoRaw && !isHttpUrl(photoRaw) ? photoRaw : undefined,
  };
};

export { hasLogPhoto, mapProject, mapProjectYarn, mapWorkLog, pickLatestLogs };
