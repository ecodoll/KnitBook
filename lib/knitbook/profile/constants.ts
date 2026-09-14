/** 프로필 사진 Storage 버킷 이름 */
export const PROFILE_IMAGE_BUCKET = "profile-images";

/**
 * profile-images가 아직 없으면 이미 있는 이미지 버킷에 같은 사용자 폴더로 올린다.
 */
export const PROFILE_IMAGE_FALLBACK_BUCKETS = [
  "yarn-images",
  "pattern-pdfs",
] as const;

/** 프로필 사진 업로드·조회 때 시도할 버킷 순서 */
export const PROFILE_IMAGE_BUCKETS = [
  PROFILE_IMAGE_BUCKET,
  ...PROFILE_IMAGE_FALLBACK_BUCKETS,
] as const;

/** 서명 URL 유효 시간(초) */
export const PROFILE_SIGNED_URL_TTL = 60 * 60;

/** 프로필 사진 최대 용량(8MB) */
export const PROFILE_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

/** 허용하는 프로필 사진 MIME 타입 */
export const PROFILE_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif";

/** 닉네임 최대 길이 */
export const PROFILE_NICKNAME_MAX_LENGTH = 20;

/** 헤더·프로필에 쓰는 users 컬럼 */
export const PROFILE_SELECT = "id, email, nickname, profile_image";

/**
 * Storage 오류가 버킷 없음인지 판별한다.
 */
export const isProfileImageBucketMissingError = (error: {
  message?: string;
  statusCode?: string | number;
}) => {
  const message = (error.message ?? "").toLowerCase();
  const status = String(error.statusCode ?? "");
  return message.includes("bucket not found") || status === "404";
};

/**
 * 프로필 사진 업로드 실패를 사용자용 한글로 바꾼다.
 */
export const mapProfileImageUploadError = (error: { message?: string }) => {
  const message = (error.message ?? "").toLowerCase();

  if (message.includes("bucket not found")) {
    return "프로필 사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.";
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
    return "프로필 사진을 올릴 권한이 없어요. 다시 로그인해 주세요.";
  }

  return "프로필 사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.";
};

/**
 * 프로필 사진 Storage 경로를 만든다. 파일명을 바꿔 캐시된 이전 사진을 피한다.
 */
export const buildProfileImagePath = (userId: string, extension: string) => {
  return `${userId}/profile-avatar-${Date.now()}.${extension}`;
};
