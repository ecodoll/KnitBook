/**
 * KnitBook 공개 사이트·애드센스 연동에 쓰는 공통 설정을 제공한다.
 */

const FALLBACK_SITE_URL = "http://localhost:3000";
const FALLBACK_CONTACT_EMAIL = "ecodoll7@gmail.com";
const PRODUCTION_CANONICAL_ORIGIN = "https://www.knitbook.app";
const PRODUCTION_HOSTS = new Set(["knitbook.app", "www.knitbook.app"]);

/**
 * 끝에 붙는 슬래시를 제거한 절댓값을 반환한다.
 */
const trimTrailingSlash = (value: string) => {
  return value.replace(/\/+$/, "");
};

/**
 * Vercel이 apex를 www로 보내므로 검색용 주소도 www로 맞춘다.
 */
const toCanonicalSiteUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (PRODUCTION_HOSTS.has(url.hostname)) {
      return PRODUCTION_CANONICAL_ORIGIN;
    }
    return trimTrailingSlash(url.toString());
  } catch {
    return trimTrailingSlash(value);
  }
};

/**
 * 배포 URL을 환경 변수에서 고른다.
 */
export const getSiteUrl = () => {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return toCanonicalSiteUrl(fromEnv);
  }

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) {
    return toCanonicalSiteUrl(`https://${vercelProduction}`);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return toCanonicalSiteUrl(`https://${vercelUrl}`);
  }

  return FALLBACK_SITE_URL;
};

/**
 * 공개 페이지의 검색용 절대 주소를 만든다.
 */
export const getPageUrl = (path = "") => {
  const origin = getSiteUrl();
  if (!path || path === "/") {
    return origin;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${trimTrailingSlash(normalized)}`;
};

/**
 * 문의·개인정보 안내에 쓸 연락 이메일을 반환한다.
 */
export const getContactEmail = () => {
  const fromEnv = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  return fromEnv || FALLBACK_CONTACT_EMAIL;
};

/**
 * AdSense 게시자 ID(ca-pub-…)를 반환한다. 없으면 null.
 */
export const getAdSenseClientId = () => {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();
  if (!clientId) {
    return null;
  }

  return clientId.startsWith("ca-pub-") ? clientId : `ca-pub-${clientId}`;
};

/**
 * ads.txt에 쓰는 pub-… 형태 게시자 ID를 반환한다.
 */
export const getAdSensePublisherId = () => {
  const clientId = getAdSenseClientId();
  if (!clientId) {
    return null;
  }

  return clientId.replace(/^ca-/, "");
};

/**
 * 콘텐츠 페이지용 디스플레이 광고 슬롯 ID를 반환한다.
 */
export const getAdSenseSlotId = (slot: "landing" | "guide") => {
  const key =
    slot === "landing"
      ? "NEXT_PUBLIC_ADSENSE_SLOT_LANDING"
      : "NEXT_PUBLIC_ADSENSE_SLOT_GUIDE";
  const value = process.env[key]?.trim();
  return value || null;
};

/**
 * 광고 스크립트·슬롯을 그릴 수 있는지 판별한다.
 */
export const canRenderAds = () => {
  return Boolean(getAdSenseClientId());
};

export const SITE_NAME = "KnitBook";
export const SITE_TAGLINE =
  "도안·작품·실을 한곳에서 관리하는 나만의 뜨개 비서";
export const SITE_DESCRIPTION =
  "KnitBook은 흩어진 PDF 도안, 진행 중인 작품, 보유 실 재고를 한곳에 모아 기록하는 뜨개인을 위한 웹 서비스입니다.";
