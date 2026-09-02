import {
  YARN_IMAGE_BUCKET,
  YARN_IMAGE_FALLBACK_BUCKET,
} from "@/lib/knitbook/yarns/constants";

/** projects 목록·상세에 쓰는 컬럼 */
export const PROJECT_SELECT =
  "id, user_id, pattern_id, title, status, progress_percent, current_row, total_row, size, started_at, target_date, completed_at, cover_image_url, notes, created_at, updated_at";

/** 작품 상세에서 연결 실·도안명까지 함께 불러오는 쿼리 */
export const PROJECT_DETAIL_SELECT = `${PROJECT_SELECT}, patterns(id, title), project_yarns(id, yarn_id, planned_quantity, used_quantity, yarns(id, brand, product_name, color_name, remaining_weight))`;

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
