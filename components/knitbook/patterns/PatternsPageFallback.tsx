import LoadingState from "@/components/knitbook/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * 도안 목록이 준비되는 동안 헤더 골격과 카드 스켈레톤을 보여 준다.
 */
const PatternsPageFallback = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">도안</h1>
          <p className="text-sm text-muted-foreground">
            PDF 도안을 업로드하고 한곳에서 관리해요.
          </p>
        </div>
        <Button size="sm" disabled>
          <Plus data-icon="inline-start" />
          올리기
        </Button>
      </div>
      <LoadingState variant="cards" rows={6} />
    </div>
  );
};

export default PatternsPageFallback;
