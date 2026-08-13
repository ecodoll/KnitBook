import Link from "next/link";

type KnitBookLogoProps = {
  /** 로고 아래 서비스명 표시 여부 */
  showWordmark?: boolean;
};

/**
 * KnitBook 워드마크 로고를 표시한다.
 */
const KnitBookLogo = ({ showWordmark = true }: KnitBookLogoProps) => {
  return (
    <Link
      href="/"
      className="inline-flex flex-col items-center gap-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      aria-label="KnitBook 홈"
    >
      <span
        className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm"
        aria-hidden
      >
        <svg
          viewBox="0 0 48 48"
          className="size-9"
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
      </span>
      {showWordmark ? (
        <span className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          KnitBook
        </span>
      ) : null}
    </Link>
  );
};

export default KnitBookLogo;
