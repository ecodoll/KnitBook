import Link from "next/link";
import type { Pattern } from "@/components/knitbook/types";
import PatternCard from "@/components/knitbook/patterns/PatternCard";
import EmptyState from "@/components/knitbook/shared/EmptyState";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import { Button } from "@/components/ui/button";

type RecentPatternsSectionProps = {
  patterns: Pattern[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
};

/**
 * 홈의 최근 도안 섹션을 렌더링한다.
 */
const RecentPatternsSection = ({
  patterns,
  isLoading,
  errorMessage,
  onRetry,
}: RecentPatternsSectionProps) => {
  return (
    <section className="space-y-3" aria-labelledby="recent-patterns-heading">
      <div className="flex items-center justify-between gap-2">
        <h2 id="recent-patterns-heading" className="text-base font-medium">
          최근 도안
        </h2>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/patterns" />}
        >
          전체 보기
        </Button>
      </div>

      {isLoading ? <LoadingState variant="cards" rows={3} /> : null}

      {!isLoading && errorMessage ? (
        <ErrorState message={errorMessage} onRetry={onRetry} />
      ) : null}

      {!isLoading && !errorMessage && patterns.length === 0 ? (
        <EmptyState
          title="등록된 도안이 없어요"
          description="PDF 도안을 올려 한곳에서 관리해 보세요."
          actionLabel="도안 올리기"
          actionHref="/patterns/new"
        />
      ) : null}

      {!isLoading && !errorMessage && patterns.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {patterns.map((pattern) => (
            <li key={pattern.id}>
              <PatternCard pattern={pattern} compact />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
};

export default RecentPatternsSection;
