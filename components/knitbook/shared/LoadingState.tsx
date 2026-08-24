import PageLoading from "@/components/knitbook/shared/PageLoading";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  /** 스켈레톤 행 개수 */
  rows?: number;
  className?: string;
  /** 카드형 스켈레톤 여부 */
  variant?: "list" | "cards" | "detail" | "spinner";
};

/**
 * 목록·카드·상세 로딩 스켈레톤 또는 뜨개 스피너를 표시한다.
 */
const LoadingState = ({
  rows = 3,
  className,
  variant = "list",
}: LoadingStateProps) => {
  if (variant === "spinner") {
    return <PageLoading className={cn("min-h-[12rem] py-8", className)} />;
  }

  if (variant === "cards") {
    return (
      <div
        className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3", className)}
        role="status"
        aria-label="불러오는 중"
      >
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="aspect-[3/4] w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
        <span className="sr-only">불러오는 중이에요…</span>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={cn("space-y-4", className)} role="status" aria-label="불러오는 중">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-10 w-full rounded-md" />
        <span className="sr-only">불러오는 중이에요…</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)} role="status" aria-label="불러오는 중">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="size-16 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2 py-1">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
      <span className="sr-only">불러오는 중이에요…</span>
    </div>
  );
};

export default LoadingState;
