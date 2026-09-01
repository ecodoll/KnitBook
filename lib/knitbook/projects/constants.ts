/** projects 목록·상세에 쓰는 컬럼 */
export const PROJECT_SELECT =
  "id, user_id, pattern_id, title, status, progress_percent, current_row, total_row, size, started_at, target_date, completed_at, cover_image_url, notes, created_at, updated_at";

/** 작품 상세에서 연결 실·도안명까지 함께 불러오는 쿼리 */
export const PROJECT_DETAIL_SELECT = `${PROJECT_SELECT}, patterns(id, title), project_yarns(id, yarn_id, planned_quantity, used_quantity, yarns(id, brand, product_name, color_name, remaining_weight, recommended_needle))`;
