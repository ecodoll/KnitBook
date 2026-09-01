/** 남은 무게가 이 값(g) 미만이면 부족으로 본다. */
export const LOW_STOCK_GRAMS = 100;

/** 실 사진 Storage 버킷 이름 */
export const YARN_IMAGE_BUCKET = "yarn-images";

/** 서명 URL 유효 시간(초) */
export const YARN_SIGNED_URL_TTL = 60 * 60;

/** 실 사진 최대 용량(8MB) */
export const YARN_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

/** 허용하는 실 사진 MIME 타입 */
export const YARN_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

/** yarns 테이블에서 목록·상세에 쓰는 컬럼 */
export const YARN_SELECT =
  "id, brand, product_name, product_code, color_name, weight_gram, remaining_weight, yarn_image_url, is_in_use, notes, created_at, updated_at";

/**
 * 파일 MIME/이름에서 저장용 확장자를 고른다.
 */
export const getYarnImageExtension = (file: File) => {
  const type = file.type.toLowerCase();
  if (type === "image/png") {
    return "png";
  }
  if (type === "image/webp") {
    return "webp";
  }
  if (type === "image/heic" || type === "image/heif") {
    return "heic";
  }

  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName === "png" || fromName === "webp" || fromName === "heic" || fromName === "heif") {
    return fromName === "heif" ? "heic" : fromName;
  }

  return "jpg";
};

/**
 * 실 사진 Storage 경로를 만든다.
 */
export const buildYarnImagePath = (
  userId: string,
  yarnId: string,
  extension: string
) => {
  return `${userId}/${yarnId}.${extension}`;
};
