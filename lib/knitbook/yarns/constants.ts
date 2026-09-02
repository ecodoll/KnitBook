/** 남은 무게가 이 값(g) 미만이면 부족으로 본다. */
export const LOW_STOCK_GRAMS = 100;

/** 실 사진 Storage 버킷 이름 */
export const YARN_IMAGE_BUCKET = "yarn-images";

/**
 * yarn-images가 아직 없으면 이미 있는 도안 버킷에 같은 사용자 폴더로 올린다.
 */
export const YARN_IMAGE_FALLBACK_BUCKET = "pattern-pdfs";

/** 실 사진 업로드·조회 때 시도할 버킷 순서 */
export const YARN_IMAGE_BUCKETS = [
  YARN_IMAGE_BUCKET,
  YARN_IMAGE_FALLBACK_BUCKET,
] as const;

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
 * 안드로이드 등에서 오는 비표준 MIME을 Storage가 받는 값으로 바꾼다.
 */
export const normalizeYarnImageContentType = (file: Pick<File, "name" | "type">) => {
  const type = file.type.toLowerCase();
  if (type === "image/jpg" || type === "image/pjpeg") {
    return "image/jpeg";
  }
  if (type.startsWith("image/")) {
    return type;
  }

  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName === "png") {
    return "image/png";
  }
  if (fromName === "webp") {
    return "image/webp";
  }
  if (fromName === "heic" || fromName === "heif") {
    return "image/heic";
  }

  return "image/jpeg";
};

/**
 * 파일 MIME/이름에서 저장용 확장자를 고른다.
 */
export const getYarnImageExtension = (file: Pick<File, "name" | "type">) => {
  const type = normalizeYarnImageContentType(file);
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
 * Storage 오류가 버킷 없음인지 판별한다.
 */
export const isYarnImageBucketMissingError = (error: {
  message?: string;
  statusCode?: string | number;
}) => {
  const message = (error.message ?? "").toLowerCase();
  const status = String(error.statusCode ?? "");
  return message.includes("bucket not found") || status === "404";
};

/**
 * Storage 업로드 실패를 사용자용 한글로 바꾼다.
 */
export const mapYarnImageUploadError = (error: { message?: string }) => {
  const message = (error.message ?? "").toLowerCase();

  if (message.includes("bucket not found")) {
    return "실 사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.";
  }
  if (
    message.includes("payload too large") ||
    message.includes("maximum allowed size") ||
    message.includes("exceeded the maximum")
  ) {
    return "사진 용량은 8MB 이하로 올려 주세요.";
  }
  if (
    message.includes("mime") ||
    message.includes("content type") ||
    message.includes("invalid type")
  ) {
    return "JPEG, PNG, WebP 사진만 올릴 수 있어요.";
  }
  if (message.includes("row-level security") || message.includes("unauthorized")) {
    return "실 사진을 올릴 권한이 없어요. 다시 로그인해 주세요.";
  }

  return "실 사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.";
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
