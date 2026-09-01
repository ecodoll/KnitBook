/** 남은 중량이 이 값(g) 미만이면 부족으로 본다. */
export const LOW_STOCK_GRAMS = 100;

/** yarns 테이블에서 목록·상세에 쓰는 컬럼 */
export const YARN_SELECT =
  "id, brand, product_name, product_code, color_name, color_code, lot_number, material, weight_gram, length_meter, thickness, recommended_needle, quantity, remaining_weight, purchase_date, purchase_price, purchase_store, yarn_image_url, is_in_use, notes, created_at, updated_at";
