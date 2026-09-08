import ListToolbarFallback from "@/components/knitbook/shared/ListToolbarFallback";
import LoadingState from "@/components/knitbook/shared/LoadingState";

/**
 * 실 목록이 준비되는 동안 검색·필터 골격과 격자 스켈레톤을 보여 준다.
 */
const YarnsPageFallback = () => {
  return (
    <div className="space-y-4">
      <ListToolbarFallback showFilters />
      <LoadingState variant="grid" rows={6} className="-mx-4" />
    </div>
  );
};

export default YarnsPageFallback;
