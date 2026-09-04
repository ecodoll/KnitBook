/** 서명 URL 메모리 캐시 항목 */
type SignedUrlCacheEntry = {
  url: string;
  expiresAt: number;
};

const signedUrlCache = new Map<string, SignedUrlCacheEntry>();
const inflightSignedUrls = new Map<string, Promise<string | undefined>>();

/**
 * 캐시된 서명 URL을 반환한다. 만료됐으면 비운다.
 */
const getCachedSignedUrl = (key: string) => {
  const hit = signedUrlCache.get(key);
  if (!hit) {
    return undefined;
  }

  if (hit.expiresAt <= Date.now()) {
    signedUrlCache.delete(key);
    return undefined;
  }

  return hit.url;
};

/**
 * 서명 URL을 TTL과 함께 캐시에 넣는다.
 */
const setCachedSignedUrl = (key: string, url: string, ttlMs: number) => {
  signedUrlCache.set(key, { url, expiresAt: Date.now() + ttlMs });
};

/**
 * 같은 경로의 서명 요청을 합쳐 한 번만 실행한다.
 */
const rememberSignedUrl = async (
  key: string,
  loader: () => Promise<string | undefined>,
  ttlMs: number
) => {
  const cached = getCachedSignedUrl(key);
  if (cached) {
    return cached;
  }

  const inflight = inflightSignedUrls.get(key);
  if (inflight) {
    return inflight;
  }

  const pending = loader()
    .then((url) => {
      if (url) {
        setCachedSignedUrl(key, url, ttlMs);
      }
      return url;
    })
    .finally(() => {
      inflightSignedUrls.delete(key);
    });

  inflightSignedUrls.set(key, pending);
  return pending;
};

export { getCachedSignedUrl, rememberSignedUrl, setCachedSignedUrl };
