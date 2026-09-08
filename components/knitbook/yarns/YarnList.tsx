"use client";

import Link from "next/link";
import type { Yarn } from "@/components/knitbook/types";
import YarnCard from "@/components/knitbook/yarns/YarnCard";
import EmptyState from "@/components/knitbook/shared/EmptyState";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import SearchBar from "@/components/knitbook/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export type YarnFilterKey = "all" | "in_use" | "low_stock";

type YarnFilterBarProps = {
  activeFilter: YarnFilterKey;
  onFilterChange: (filter: YarnFilterKey) => void;
};

const FILTERS: { key: YarnFilterKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "in_use", label: "사용 중" },
  { key: "low_stock", label: "부족" },
];

/**
 * 실 재고 빠른 필터 칩을 렌더링한다.
 */
const YarnFilterBar = ({ activeFilter, onFilterChange }: YarnFilterBarProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="toolbar" aria-label="실 필터">
      {FILTERS.map((filter) => (
        <Button
          key={filter.key}
          type="button"
          size="sm"
          variant={activeFilter === filter.key ? "default" : "outline"}
          onClick={() => onFilterChange(filter.key)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

type YarnListProps = {
  yarns: Yarn[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: YarnFilterKey;
  onFilterChange: (filter: YarnFilterKey) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  className?: string;
};

/**
 * 실 추가 격자 칸을 표시한다.
 */
const YarnAddTile = () => {
  return (
    <li className="min-w-0">
      <Link
        href="/yarns/new"
        className="flex aspect-square w-full items-center justify-center bg-muted text-muted-foreground outline-none transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/60"
        aria-label="실 등록"
      >
        <Plus className="size-8" />
      </Link>
    </li>
  );
};

/**
 * 실 검색·필터·목록을 함께 표시한다.
 */
const YarnList = ({
  yarns,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  isLoading,
  errorMessage,
  onRetry,
  className,
}: YarnListProps) => {
  const isFiltered = Boolean(searchQuery) || activeFilter !== "all";
  const showEmptyFilter = !isLoading && !errorMessage && yarns.length === 0 && isFiltered;
  const showGrid = !isLoading && !errorMessage && !showEmptyFilter;

  return (
    <div className={cn("space-y-4", className)}>
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="이름, 브랜드, 색깔, 제품번호 검색"
        label="실 검색"
      />
      <YarnFilterBar activeFilter={activeFilter} onFilterChange={onFilterChange} />

      {isLoading ? <LoadingState variant="grid" rows={6} className="-mx-4" /> : null}

      {!isLoading && errorMessage ? (
        <ErrorState
          title="실 재고를 불러오지 못했어요"
          message={errorMessage}
          onRetry={onRetry}
        />
      ) : null}

      {showEmptyFilter ? (
        <EmptyState
          title="실이 없어요"
          description="조건에 맞는 실이 없어요. 필터를 바꿔 보세요."
        />
      ) : null}

      {showGrid ? (
        <ul className="-mx-4 grid grid-cols-3 gap-0.5">
          {yarns.map((yarn) => (
            <li key={yarn.id} className="min-w-0">
              <YarnCard yarn={yarn} />
            </li>
          ))}
          <YarnAddTile />
        </ul>
      ) : null}
    </div>
  );
};

export { YarnFilterBar };
export default YarnList;
