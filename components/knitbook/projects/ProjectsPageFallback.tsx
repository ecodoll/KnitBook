import LoadingState from "@/components/knitbook/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * 작품 목록이 준비되는 동안 상단 버튼과 카드 스켈레톤을 보여 준다.
 */
const ProjectsPageFallback = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button size="sm" disabled>
          <Plus data-icon="inline-start" />
          새 작품
        </Button>
      </div>
      <LoadingState rows={3} />
    </div>
  );
};

export default ProjectsPageFallback;
