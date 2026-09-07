import {
  YARN_IMAGE_BUCKET,
  YARN_IMAGE_FALLBACK_BUCKET,
} from "@/lib/knitbook/yarns/constants";

/** projects 목록·상세에 쓰는 기본 컬럼 (게이지 컬럼이 없는 DB와 호환) */
export const PROJECT_SELECT_CORE =
  "id, user_id, pattern_id, title, status, progress_percent, current_row, total_row, size, started_at, target_date, completed_at, cover_image_url, notes, created_at, updated_at";

/** projects 목록·상세에 쓰는 컬럼 */
export const PROJECT_SELECT = `${PROJECT_SELECT_CORE}, gauge_stitches, gauge_rows`;

/** Quick Log 소요시간 선택(15분 간격, 최대 4시간) */
export const WORK_LOG_DURATION_MINUTES = Array.from(
  { length: 16 },
  (_, index) => (index + 1) * 15
);

/** 작업 기록 카드에서 고르는 진행률(%) 프리셋 */
export const WORK_LOG_PROGRESS_PERCENTS = [0, 10, 25, 50, 75, 90, 100] as const;

/**
 * 진행률 드롭다운 옵션을 만든다. 현재 값이 프리셋에 없으면 함께 보여 저장 시 값이 바뀌지 않게 한다.
 */
export const buildProgressPercentOptions = (current?: number) => {
  const options = new Set<number>(WORK_LOG_PROGRESS_PERCENTS);

  if (typeof current === "number" && Number.isFinite(current)) {
    options.add(Math.min(100, Math.max(0, Math.round(current))));
  }

  return [...options].sort((left, right) => left - right);
};

/**
 * 작업 시간(분)을 드롭다운 라벨로 만든다.
 */
export const formatWorkDurationLabel = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`;
};

/** 작품과 함께 불러오는 도안 표지 컬럼 */
export const PROJECT_PATTERN_SELECT = "id, title, cover_image_url, pdf_url";

/** 작업 기록 목록·상세에 쓰는 컬럼 */
export const PROJECT_LOG_SELECT =
  "id, project_id, logged_on, row_count, progress_percent, work_minutes, photo_url, memo, created_at";

/** 작품 상세에서 연결 실·도안명까지 함께 불러오는 쿼리 */
export const PROJECT_DETAIL_SELECT = `${PROJECT_SELECT}, patterns(${PROJECT_PATTERN_SELECT}), project_yarns(id, yarn_id, planned_quantity, used_quantity, yarns(id, brand, product_name, color_name, remaining_weight))`;

/** 게이지 컬럼이 없을 때 쓰는 상세 쿼리 */
export const PROJECT_DETAIL_SELECT_CORE = `${PROJECT_SELECT_CORE}, patterns(${PROJECT_PATTERN_SELECT}), project_yarns(id, yarn_id, planned_quantity, used_quantity, yarns(id, brand, product_name, color_name, remaining_weight))`;

/** 게이지 컬럼이 없을 때 쓰는 목록 쿼리 */
export const PROJECT_LIST_SELECT_CORE = PROJECT_DETAIL_SELECT_CORE;

/** 목록에서 도안 제목·연결 실까지 붙인 쿼리 */
export const PROJECT_LIST_SELECT = PROJECT_DETAIL_SELECT;

/** 작품 대표 사진 Storage 버킷 이름 */
export const PROJECT_IMAGE_BUCKET = "project-images";

/** 대표 사진 업로드·조회 때 시도할 버킷 순서 */
export const PROJECT_IMAGE_BUCKETS = [
  PROJECT_IMAGE_BUCKET,
  YARN_IMAGE_BUCKET,
  YARN_IMAGE_FALLBACK_BUCKET,
] as const;

/** 서명 URL 유효 시간(초) */
export const PROJECT_SIGNED_URL_TTL = 60 * 60;

/**
 * 작품 대표 사진 Storage 경로를 만든다.
 */
export const buildProjectCoverPath = (
  userId: string,
  projectId: string,
  extension: string
) => {
  return `${userId}/projects/${projectId}.${extension}`;
};

/**
 * 작업 기록 사진 Storage 경로를 만든다.
 */
export const buildProjectLogPhotoPath = (
  userId: string,
  projectId: string,
  logId: string,
  extension: string
) => {
  return `${userId}/projects/${projectId}/logs/${logId}.${extension}`;
};
