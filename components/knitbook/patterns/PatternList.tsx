"use client";

import Link from "next/link";
import type { Pattern } from "@/components/knitbook/types";
import PatternCard from "@/components/knitbook/patterns/PatternCard";
import EmptyState from "@/components/knitbook/shared/EmptyState";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import SearchBar from "@/components/knitbook/shared/SearchBar";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

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
 * 도안 추가 격자 칸을 표시한다.
 */
const PatternAddTile = () => {
  return (
    <li className="min-w-0">
      <Link
        href="/patterns/new"
        className="flex aspect-square w-full items-center justify-center bg-muted text-muted-foreground outline-none transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/60"
        aria-label="도안 올리기"
      >
        <Plus className="size-8" />
      </Link>
    </li>
  );
};

/**
 * 도안 검색과 격자 목록을 함께 표시한다.
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
  const showEmptyFilter = !isLoading && !errorMessage && patterns.length === 0 && Boolean(searchQuery);
  const showGrid = !isLoading && !errorMessage && !showEmptyFilter;

  return (
    <div className={cn("space-y-4", className)}>
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="도안명, 디자이너, 태그 검색"
        label="도안 검색"
      />

      {isLoading ? <LoadingState variant="grid" rows={6} className="-mx-4" /> : null}

      {!isLoading && errorMessage ? (
        <ErrorState
          title="도안을 불러오지 못했어요"
          message={errorMessage}
          onRetry={onRetry}
        />
      ) : null}

      {showEmptyFilter ? (
        <EmptyState
          title="도안이 없어요"
          description="검색 조건에 맞는 도안이 없어요. 다른 단어로 찾아보세요."
        />
      ) : null}

      {showGrid ? (
        <ul className="-mx-4 grid grid-cols-3 gap-0.5">
          {patterns.map((pattern) => (
            <li key={pattern.id} className="min-w-0">
              <PatternCard pattern={pattern} />
            </li>
          ))}
          <PatternAddTile />
        </ul>
      ) : null}
    </div>
  );
};

export default PatternList;
