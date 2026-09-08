import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ListToolbarFallbackProps = {
  showFilters?: boolean;
  className?: string;
};

/**
 * 목록 툴바가 준비되는 동안 검색·등록·필터 골격을 보여 준다.
 */
const ListToolbarFallback = ({
  showFilters = false,
  className,
}: ListToolbarFallbackProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 min-w-0 flex-1 rounded-md" />
        <Skeleton className="h-8 w-16 shrink-0 rounded-md" />
      </div>
      {showFilters ? <Skeleton className="h-8 w-full rounded-md" /> : null}
    </div>
  );
};

export default ListToolbarFallback;
