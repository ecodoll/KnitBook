"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minus,
  Plus,
} from "lucide-react";

type PatternViewerProps = {
  title: string;
  currentPage: number;
  totalPages: number;
  zoomPercent?: number;
  onPageChange: (page: number) => void;
  onZoomChange?: (zoomPercent: number) => void;
  onToggleBookmark?: () => void;
  onToggleFullscreen?: () => void;
  /** PDF 캔버스/iframe 영역 */
  children?: ReactNode;
  className?: string;
  isLoading?: boolean;
};

/**
 * 모바일 우선 PDF 뷰어 툴바와 뷰 영역을 구성한다.
 */
const PatternViewer = ({
  title,
  currentPage,
  totalPages,
  zoomPercent = 100,
  onPageChange,
  onZoomChange,
  onToggleBookmark,
  onToggleFullscreen,
  children,
  className,
  isLoading,
}: PatternViewerProps) => {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className={cn("flex h-full min-h-[70vh] flex-col bg-background", className)}>
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <h1 className="truncate text-sm font-medium">{title}</h1>
        <div className="flex items-center gap-1">
          {onToggleBookmark ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onToggleBookmark}
              aria-label="북마크"
            >
              <Bookmark />
            </Button>
          ) : null}
          {onToggleFullscreen ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onToggleFullscreen}
              aria-label="전체 화면"
            >
              <Maximize2 />
            </Button>
          ) : null}
        </div>
      </header>

      <div className="relative flex flex-1 items-center justify-center overflow-auto bg-muted/40 p-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">도안을 불러오는 중이에요…</p>
        ) : (
          children ?? (
            <p className="text-sm text-muted-foreground">
              PDF 뷰어 영역 (페이지 {currentPage})
            </p>
          )
        )}
      </div>

      <footer className="flex items-center justify-between gap-2 border-t border-border px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={!canGoPrev}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="이전 페이지"
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-16 text-center text-xs tabular-nums text-muted-foreground">
            {currentPage} / {totalPages || "—"}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={!canGoNext}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="다음 페이지"
          >
            <ChevronRight />
          </Button>
        </div>

        {onZoomChange ? (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onZoomChange(Math.max(50, zoomPercent - 10))}
              aria-label="축소"
            >
              <Minus />
            </Button>
            <span className="w-10 text-center text-xs tabular-nums">{zoomPercent}%</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onZoomChange(Math.min(200, zoomPercent + 10))}
              aria-label="확대"
            >
              <Plus />
            </Button>
          </div>
        ) : null}
      </footer>
    </div>
  );
};

export default PatternViewer;
