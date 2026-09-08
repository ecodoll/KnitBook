import ListToolbarFallback from "@/components/knitbook/shared/ListToolbarFallback";
import LoadingState from "@/components/knitbook/shared/LoadingState";

/**
 * 작품 목록이 준비되는 동안 검색·필터 골격과 카드 스켈레톤을 보여 준다.
 */
const ProjectsPageFallback = () => {
  return (
    <div className="space-y-4">
      <ListToolbarFallback showFilters />
      <LoadingState rows={3} />
    </div>
  );
};

export default ProjectsPageFallback;
