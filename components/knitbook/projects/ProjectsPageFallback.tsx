import LoadingState from "@/components/knitbook/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * 작품 목록이 준비되는 동안 헤더 골격과 카드 스켈레톤을 보여 준다.
 */
const ProjectsPageFallback = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">작품</h1>
          <p className="text-sm text-muted-foreground">
            진행 중인 작품을 기록하고 도안·실과 연결해요.
          </p>
        </div>
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
