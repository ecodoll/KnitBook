/**
 * 로그인 없이 접근 가능한 공개 경로를 판별한다.
 */

const PUBLIC_EXACT_PATHS = [
  "/",
  "/welcome",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/guides",
  "/robots.txt",
  "/sitemap.xml",
  "/ads.txt",
] as const;

const PUBLIC_PREFIXES = ["/guides/"] as const;

const PROTECTED_PREFIXES = ["/patterns", "/projects", "/yarns"] as const;

/**
 * 애드센스·검색 엔진이 로그인 없이 볼 수 있는 경로인지 판별한다.
 */
export const isPublicPath = (pathname: string) => {
  if (PUBLIC_EXACT_PATHS.includes(pathname as (typeof PUBLIC_EXACT_PATHS)[number])) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
};

/**
 * 로그인해야만 볼 수 있는 앱 경로인지 판별한다.
 */
export const isProtectedPath = (pathname: string) => {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
};
