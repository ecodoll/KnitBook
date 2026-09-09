"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "knitbook-cookie-consent";
const consentListeners = new Set<() => void>();

/**
 * 같은 탭에서 쿠키 동의 값 변경을 구독자에게 알린다.
 */
const emitConsentChange = () => {
  consentListeners.forEach((listener) => {
    listener();
  });
};

/**
 * 쿠키 동의 저장소 변경을 구독한다.
 */
const subscribeConsent = (onStoreChange: () => void) => {
  consentListeners.add(onStoreChange);
  return () => {
    consentListeners.delete(onStoreChange);
  };
};

/**
 * 아직 확인하지 않은 방문자인지 읽는다.
 */
const getConsentSnapshot = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "accepted";
  } catch {
    return true;
  }
};

/**
 * 서버 렌더에서는 배너를 숨겨 하이드레이션 불일치를 피한다.
 */
const getConsentServerSnapshot = () => {
  return false;
};

/**
 * 쿠키·맞춤 광고 사용을 알리고 확인을 받는 배너를 보여 준다.
 */
const CookieConsent = () => {
  const isVisible = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot
  );

  const handleAccept = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[쿠키 동의 저장 실패]", error);
      }
    }
    emitConsentChange();
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-muted-foreground">
          KnitBook은 서비스 운영과 Google 광고 안내에 쿠키를 사용할 수 있어요.
          자세한 내용은{" "}
          <Link
            href="/privacy"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            개인정보처리방침
          </Link>
          에서 확인할 수 있어요.
        </p>
        <Button type="button" size="sm" className="shrink-0" onClick={handleAccept}>
          확인
        </Button>
      </div>
    </div>
  );
};

export default CookieConsent;
