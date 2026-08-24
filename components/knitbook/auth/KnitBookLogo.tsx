"use client";

import Link, { useLinkStatus } from "next/link";
import KnitSpinner from "@/components/knitbook/shared/KnitSpinner";
import { cn } from "@/lib/utils";

type KnitBookLogoProps = {
  /** 로고 옆/아래 서비스명 표시 여부 */
  showWordmark?: boolean;
  /** stacked: 인증 화면용 세로 배치, inline: 헤더용 가로 배치 */
  variant?: "stacked" | "inline";
};

/**
 * 홈으로 이동 중인 동안 로고 자리에 스피너를 보여준다.
 */
const LogoPending = ({ isInline }: { isInline: boolean }) => {
  const { pending } = useLinkStatus();

  if (!pending) {
    return null;
  }

  return (
    <span
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-primary text-primary-foreground",
        isInline ? "rounded-lg" : "rounded-2xl"
      )}
    >
      <KnitSpinner
        className={isInline ? "size-4" : "size-7"}
        aria-hidden
      />
    </span>
  );
};

/**
 * KnitBook 워드마크 로고를 표시한다.
 */
const KnitBookLogo = ({
  showWordmark = true,
  variant = "stacked",
}: KnitBookLogoProps) => {
  const isInline = variant === "inline";

  return (
    <Link
      href="/"
      prefetch
      className={cn(
        "inline-flex outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        isInline
          ? "shrink-0 items-center gap-2 rounded-md"
          : "flex-col items-center gap-3"
      )}
      aria-label="KnitBook 홈"
    >
      <span
        className={cn(
          "relative flex items-center justify-center bg-primary text-primary-foreground shadow-sm",
          isInline ? "size-8 rounded-lg" : "size-16 rounded-2xl"
        )}
        aria-hidden
      >
        <svg
          viewBox="0 0 48 48"
          className={isInline ? "size-5" : "size-9"}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 34c0-8 6-12 10-14 4 2 10 6 10 14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M18 18c2-4 5-7 6-8 1 1 4 4 6 8"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="24" cy="36" r="2.5" fill="currentColor" />
          <path
            d="M12 22h6M30 22h6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <LogoPending isInline={isInline} />
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "font-heading font-semibold tracking-tight text-foreground",
            isInline ? "text-base" : "text-3xl"
          )}
        >
          KnitBook
        </span>
      ) : null}
    </Link>
  );
};

export default KnitBookLogo;
