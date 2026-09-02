import Link from "next/link";
import type { YarnInventorySummary } from "@/components/knitbook/types";
import HomeSectionEmpty from "@/components/knitbook/home/HomeSectionEmpty";
import HomeSectionHeader from "@/components/knitbook/home/HomeSectionHeader";
import { HOME_YARN_THUMB_LIMIT } from "@/components/knitbook/home/constants";
import YarnPhoto from "@/components/knitbook/yarns/YarnPhoto";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";

type YarnSummarySectionProps = {
  summary: YarnInventorySummary | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
};

/**
 * 홈의 실 재고를 아이콘 스트립과 한 줄 요약으로 보여준다.
 */
const YarnSummarySection = ({
  summary,
  isLoading,
  errorMessage,
  onRetry,
}: YarnSummarySectionProps) => {
  const thumbs = summary?.recentYarns.slice(0, HOME_YARN_THUMB_LIMIT) ?? [];

  return (
    <section className="space-y-2" aria-labelledby="yarn-summary-heading">
      <HomeSectionHeader id="yarn-summary-heading" title="내 실" icon={Scissors}>
        <Button
          variant="ghost"
          size="xs"
          nativeButton={false}
          render={<Link href="/yarns" />}
        >
          전체
        </Button>
      </HomeSectionHeader>

      {isLoading ? <LoadingState rows={1} /> : null}

      {!isLoading && errorMessage ? (
        <ErrorState message={errorMessage} onRetry={onRetry} />
      ) : null}

      {!isLoading && !errorMessage && (!summary || summary.totalKinds === 0) ? (
        <HomeSectionEmpty
          message="등록된 실이 없어요"
          actionLabel="등록"
          actionHref="/yarns/new"
        />
      ) : null}

      {!isLoading && !errorMessage && summary && summary.totalKinds > 0 ? (
        <Link
          href="/yarns"
          className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 ring-1 ring-foreground/10 outline-none transition-shadow hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {thumbs.length > 0 ? (
            <div className="flex shrink-0 -space-x-2" aria-hidden>
              {thumbs.map((yarn) => (
                <YarnPhoto
                  key={yarn.id}
                  yarn={yarn}
                  className="size-9 rounded-full ring-2 ring-card"
                />
              ))}
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              {summary.totalKinds}종
              {typeof summary.totalRemainingGrams === "number"
                ? ` · ${summary.totalRemainingGrams}g`
                : ""}
            </p>
            {summary.lowStockCount > 0 ? (
              <p className="text-xs text-brand-warning">
                부족·소진 예정 {summary.lowStockCount}종
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">재고 상태가 양호해요</p>
            )}
          </div>
        </Link>
      ) : null}
    </section>
  );
};

export default YarnSummarySection;
