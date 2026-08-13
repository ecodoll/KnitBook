"use client";

import type { Pattern } from "@/components/knitbook/types";
import PatternCard from "@/components/knitbook/patterns/PatternCard";
import EmptyState from "@/components/knitbook/shared/EmptyState";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import SearchBar from "@/components/knitbook/shared/SearchBar";
import { cn } from "@/lib/utils";

type PatternListProps = {
  patterns: Pattern[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  view?: "cards" | "list";
  className?: string;
};

/**
 * 도안 검색과 카드/리스트 목록을 함께 표시한다.
 */
const PatternList = ({
  patterns,
  searchQuery,
  onSearchChange,
  isLoading,
  errorMessage,
  onRetry,
  view = "cards",
  className,
}: PatternListProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="도안명, 디자이너, 태그 검색"
        label="도안 검색"
      />

      {isLoading ? (
        <LoadingState variant={view === "cards" ? "cards" : "list"} rows={6} />
      ) : null}

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
            searchQuery
              ? "검색 조건에 맞는 도안이 없어요. 다른 단어로 찾아보세요."
              : "PDF 도안을 올려 목록을 채워 보세요."
          }
          actionLabel={searchQuery ? undefined : "도안 올리기"}
          actionHref={searchQuery ? undefined : "/patterns/new"}
        />
      ) : null}

      {!isLoading && !errorMessage && patterns.length > 0 ? (
        <ul
          className={cn(
            view === "cards"
              ? "grid grid-cols-2 gap-3 sm:grid-cols-3"
              : "space-y-3"
          )}
        >
          {patterns.map((pattern) => (
            <li key={pattern.id}>
              <PatternCard pattern={pattern} compact={view === "cards"} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default PatternList;
