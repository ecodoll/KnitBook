/** Supabase Storage 도안 PDF·표지 버킷 이름 */
export const PATTERN_PDF_BUCKET = "pattern-pdfs";

/** 서명 URL 유효 시간(초) */
export const PATTERN_SIGNED_URL_TTL = 60 * 60;

/** 표지 JPEG MIME 타입 */
export const PATTERN_COVER_CONTENT_TYPE = "image/jpeg";

/**
 * 도안 PDF Storage 경로를 만든다.
 */
export const buildPatternPdfPath = (userId: string, patternId: string) => {
  return `${userId}/${patternId}.pdf`;
};

/**
 * 도안 표지(썸네일) Storage 경로를 만든다.
 */
export const buildPatternCoverPath = (userId: string, patternId: string) => {
  return `${userId}/${patternId}-cover.jpg`;
};
