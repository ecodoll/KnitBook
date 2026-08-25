import KnitSpinner from "@/components/knitbook/shared/KnitSpinner";
import { cn } from "@/lib/utils";

type PageLoadingProps = {
  className?: string;
  /** 화면 전체를 채울지 여부 */
  fullScreen?: boolean;
};

/**
 * 페이지·구간 전환에 쓰는 뜨개 스피너 로딩 화면이다.
 * 문구 없이 실타래 애니메이션만 표시한다.
 */
const PageLoading = ({ className, fullScreen = false }: PageLoadingProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        fullScreen ? "min-h-full flex-1 py-16" : "min-h-[50vh] py-10",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="불러오는 중"
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
    </div>
  );
};

export default PageLoading;
