import ListToolbarFallback from "@/components/knitbook/shared/ListToolbarFallback";
import LoadingState from "@/components/knitbook/shared/LoadingState";

/**
 * 도안 목록이 준비되는 동안 검색·등록 골격과 격자 스켈레톤을 보여 준다.
 */
const PatternsPageFallback = () => {
  return (
    <div className="space-y-4">
      <ListToolbarFallback />
      <LoadingState variant="grid" rows={6} className="-mx-4" />
    </div>
  );
};

export default PatternsPageFallback;
