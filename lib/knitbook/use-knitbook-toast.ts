"use client";

import { toast } from "@/components/ui/toast";

type ToastType = "success" | "error" | "info" | "warning";

/**
 * KnitBook 공통 토스트 알림을 표시한다.
 */
const showKnitbookToast = (
  title: string,
  options?: { description?: string; type?: ToastType }
) => {
  toast.add({
    title,
    description: options?.description,
    type: options?.type ?? "info",
  });
};

/**
 * 성공 토스트를 표시한다.
 */
const showSuccessToast = (title: string, description?: string) => {
  showKnitbookToast(title, { description, type: "success" });
};

/**
 * 오류 토스트를 표시한다.
 */
const showErrorToast = (title: string, description?: string) => {
  showKnitbookToast(title, { description, type: "error" });
};

/**
 * Supabase/네트워크 오류를 사용자용 메시지로 변환해 토스트로 표시한다.
 */
const showNetworkErrorToast = (error: unknown, fallbackTitle: string) => {
  if (process.env.NODE_ENV === "development") {
    console.error(fallbackTitle, error);
  }

  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
      ? error.message
      : undefined;

  const isAuthError =
    message?.toLowerCase().includes("jwt") ||
    message?.toLowerCase().includes("not authenticated") ||
    message?.toLowerCase().includes("session");

  showErrorToast(
    isAuthError ? "로그인이 필요해요" : fallbackTitle,
    isAuthError
      ? "다시 로그인한 뒤 시도해 주세요."
      : "네트워크 상태를 확인하고 잠시 후 다시 시도해 주세요."
  );
};

export {
  showKnitbookToast,
  showSuccessToast,
  showErrorToast,
  showNetworkErrorToast,
};
