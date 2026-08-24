import KnitSpinner from "@/components/knitbook/shared/KnitSpinner";
import { cn } from "@/lib/utils";

type PageLoadingProps = {
  /** 사용자에게 보여줄 안내 문구 */
  message?: string;
  className?: string;
  /** 화면 전체를 채울지 여부 */
  fullScreen?: boolean;
};

/**
 * 페이지·구간 전환에 쓰는 뜨개 스피너 로딩 화면이다.
 */
const PageLoading = ({
  message = "실을 감는 중이에요…",
  className,
  fullScreen = false,
}: PageLoadingProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen ? "min-h-full flex-1 py-16" : "min-h-[50vh] py-10",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative flex size-[5.5rem] items-center justify-center">
        <svg
          viewBox="0 0 88 88"
          className="absolute inset-0 size-full text-brand-berry/70"
          aria-hidden
        >
          <path
            d="M22 68 L52 22"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M66 68 L36 22"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="22" cy="68" r="3.2" fill="currentColor" />
          <circle cx="66" cy="68" r="3.2" fill="currentColor" />
        </svg>
        <span className="relative flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <KnitSpinner className="size-9" aria-hidden />
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

export default PageLoading;
