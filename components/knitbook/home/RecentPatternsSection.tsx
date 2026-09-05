import Link from "next/link";
import type { Pattern } from "@/components/knitbook/types";
import HomePatternThumb from "@/components/knitbook/home/HomePatternThumb";
import HomeSectionEmpty from "@/components/knitbook/home/HomeSectionEmpty";
import HomeSectionHeader from "@/components/knitbook/home/HomeSectionHeader";
import { HOME_PATTERN_VISIBLE_LIMIT } from "@/components/knitbook/home/constants";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

type RecentPatternsSectionProps = {
  patterns: Pattern[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
};

/**
 * 홈의 최근 도안을 작은 썸네일로 가로 나열한다.
 */
const RecentPatternsSection = ({
  patterns,
  isLoading,
  errorMessage,
  onRetry,
}: RecentPatternsSectionProps) => {
  const visiblePatterns = patterns.slice(0, HOME_PATTERN_VISIBLE_LIMIT);

  return (
    <section className="space-y-2" aria-labelledby="recent-patterns-heading">
      <HomeSectionHeader id="recent-patterns-heading" title="최근 도안" icon={BookOpen}>
        <Button
          variant="ghost"
          size="xs"
          nativeButton={false}
          render={<Link href="/patterns" prefetch />}
        >
          전체
        </Button>
      </HomeSectionHeader>

      {isLoading ? <LoadingState variant="strip" rows={5} /> : null}

      {!isLoading && errorMessage ? (
        <ErrorState message={errorMessage} onRetry={onRetry} />
      ) : null}

      {!isLoading && !errorMessage && patterns.length === 0 ? (
        <HomeSectionEmpty
          message="등록된 도안이 없어요"
          actionLabel="올리기"
          actionHref="/patterns/new"
        />
      ) : null}

      {!isLoading && !errorMessage && visiblePatterns.length > 0 ? (
        <ul className="grid grid-cols-4 gap-2 min-[390px]:grid-cols-5">
          {visiblePatterns.map((pattern, index) => (
            <li
              key={pattern.id}
              className={cn(index === 4 && "hidden min-[390px]:block")}
            >
              <HomePatternThumb pattern={pattern} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
};

export default RecentPatternsSection;
