import LoadingState from "@/components/knitbook/shared/LoadingState";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 도안 목록이 준비되는 동안 검색창과 격자 스켈레톤을 보여 준다.
 */
const PatternsPageFallback = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-full rounded-md" />
      <LoadingState variant="grid" rows={6} className="-mx-4" />
    </div>
  );
};

export default PatternsPageFallback;
