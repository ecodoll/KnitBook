/** 인증(비보호) 페이지 경로 */
export const AUTH_PATHS = ["/login", "/signup"] as const;

/**
 * 인증 페이지(/login, /signup) 여부를 판별한다.
 */
export const isAuthPath = (pathname: string) => {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
};
