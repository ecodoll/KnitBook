import Link from "next/link";
import type { YarnInventorySummary } from "@/components/knitbook/types";
import EmptyState from "@/components/knitbook/shared/EmptyState";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type YarnSummarySectionProps = {
  summary: YarnInventorySummary | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
};

/**
 * 홈의 실 재고 요약 카드를 렌더링한다.
 */
const YarnSummarySection = ({
  summary,
  isLoading,
  errorMessage,
  onRetry,
}: YarnSummarySectionProps) => {
  return (
    <section className="space-y-3" aria-labelledby="yarn-summary-heading">
      <div className="flex items-center justify-between gap-2">
        <h2 id="yarn-summary-heading" className="text-base font-medium">
          내 실
        </h2>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/yarns" />}
        >
          재고 보기
        </Button>
      </div>

      {isLoading ? <LoadingState rows={1} /> : null}

      {!isLoading && errorMessage ? (
        <ErrorState message={errorMessage} onRetry={onRetry} />
      ) : null}

      {!isLoading && !errorMessage && (!summary || summary.totalKinds === 0) ? (
        <EmptyState
          title="등록된 실이 없어요"
          description="보유한 실을 등록하면 작품과 연결할 수 있어요."
          actionLabel="실 등록하기"
          actionHref="/yarns/new"
        />
      ) : null}

      {!isLoading && !errorMessage && summary && summary.totalKinds > 0 ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle>현재 {summary.totalKinds}종</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {typeof summary.totalRemainingGrams === "number" ? (
              <p>남은 양 합계 {summary.totalRemainingGrams}g</p>
            ) : null}
            {summary.lowStockCount > 0 ? (
              <p className="text-brand-warning">
                부족·소진 예정 {summary.lowStockCount}종
              </p>
            ) : (
              <p>재고 상태가 양호해요</p>
            )}
            {summary.recentYarns.length > 0 ? (
              <ul className="mt-2 space-y-1 text-foreground">
                {summary.recentYarns.slice(0, 3).map((yarn) => (
                  <li key={yarn.id} className="truncate">
                    {yarn.brand} · {yarn.productName}
                    {yarn.colorName ? ` / ${yarn.colorName}` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
};

export default YarnSummarySection;
