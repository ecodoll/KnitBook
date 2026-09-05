import LoadingState from "@/components/knitbook/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * 실 목록이 준비되는 동안 헤더 골격과 카드 스켈레톤을 보여 준다.
 */
const YarnsPageFallback = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">실</h1>
          <p className="text-sm text-muted-foreground">
            보유한 실의 종류와 남은 양을 한곳에서 관리해요.
          </p>
        </div>
        <Button size="sm" disabled>
          <Plus data-icon="inline-start" />
          등록
        </Button>
      </div>
      <LoadingState rows={4} />
    </div>
  );
};

export default YarnsPageFallback;
