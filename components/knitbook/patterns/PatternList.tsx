"use client";

import type { Pattern } from "@/components/knitbook/types";
import PatternCard from "@/components/knitbook/patterns/PatternCard";
import EmptyState from "@/components/knitbook/shared/EmptyState";
import ListToolbar from "@/components/knitbook/shared/ListToolbar";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import { cn } from "@/lib/utils";

type PatternListProps = {
  patterns: Pattern[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  className?: string;
};

/**
 * 도안 검색·등록·목록을 함께 표시한다.
 */
const PatternList = ({
  patterns,
  searchQuery,
  onSearchChange,
  isLoading,
  errorMessage,
  onRetry,
  className,
}: PatternListProps) => {
  const isFiltered = Boolean(searchQuery);

  return (
    <div className={cn("space-y-4", className)}>
      <ListToolbar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="도안명, 디자이너, 태그 검색"
        searchLabel="도안 검색"
        searchId="pattern-search"
        actionHref="/patterns/new"
        actionLabel="등록"
      />

      {isLoading ? <LoadingState variant="grid" rows={6} className="-mx-4" /> : null}

      {!isLoading && errorMessage ? (
        <ErrorState
          title="도안을 불러오지 못했어요"
          message={errorMessage}
          onRetry={onRetry}
        />
      ) : null}

      {!isLoading && !errorMessage && patterns.length === 0 ? (
        <EmptyState
          title="도안이 없어요"
          description={
            isFiltered
              ? "검색 조건에 맞는 도안이 없어요. 다른 단어로 찾아보세요."
              : "PDF 도안을 올려 목록을 채워 보세요."
          }
          actionLabel={isFiltered ? undefined : "도안 올리기"}
          actionHref={isFiltered ? undefined : "/patterns/new"}
        />
      ) : null}

      {!isLoading && !errorMessage && patterns.length > 0 ? (
        <ul className="-mx-4 grid grid-cols-3 gap-0.5">
          {patterns.map((pattern) => (
            <li key={pattern.id} className="min-w-0">
              <PatternCard pattern={pattern} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default PatternList;
