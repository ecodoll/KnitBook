"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PatternDetail, PatternPage } from "@/components/knitbook/types";
import PatternViewer from "@/components/knitbook/patterns/PatternViewer";
import PatternMemoPanel from "@/components/knitbook/patterns/PatternMemoPanel";
import StartProjectDialog from "@/components/knitbook/patterns/StartProjectDialog";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import {
  deletePattern,
  fetchPatternDetail,
  renamePattern,
  touchPatternOpened,
  upsertPatternPage,
} from "@/lib/knitbook/pattern-client";
import {
  showNetworkErrorToast,
  showSuccessToast,
} from "@/lib/knitbook/use-knitbook-toast";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Sparkles, Trash2 } from "lucide-react";
import RenamePatternDialog from "@/components/knitbook/patterns/RenamePatternDialog";

const PatternPdfCanvas = dynamic(
  () => import("@/components/knitbook/patterns/PatternPdfCanvas"),
  {
    ssr: false,
    // 뷰어 오버레이 스피너만 쓰므로 청크 로딩 UI는 비운다.
    loading: () => null,
  }
);

type PatternDetailScreenProps = {
  initialPattern: PatternDetail;
};

/**
 * 도안 PDF 뷰어·북마크·메모·작품 시작 화면을 구성한다.
 */
const PatternDetailScreen = ({ initialPattern }: PatternDetailScreenProps) => {
  const router = useRouter();
  const viewerRef = useRef<HTMLDivElement>(null);
  const [pattern, setPattern] = useState(initialPattern);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const currentPageData = useMemo(() => {
    return (
      pattern.pages.find((page) => page.pageNumber === currentPage) ?? {
        pageNumber: currentPage,
        bookmark: false,
      }
    );
  }, [pattern.pages, currentPage]);

  const reloadPattern = useCallback(async () => {
    try {
      const next = await fetchPatternDetail(pattern.id);
      setPattern(next);
      setLoadError(null);
    } catch (error) {
      showNetworkErrorToast(error, "도안을 다시 불러오지 못했어요");
    }
  }, [pattern.id]);

  useEffect(() => {
    void touchPatternOpened(pattern.id).catch((error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("[최근 열람 시각 갱신 실패]", error);
      }
    });
  }, [pattern.id]);

  const updateLocalPage = (nextPage: PatternPage) => {
    setPattern((prev) => {
      const others = prev.pages.filter(
        (page) => page.pageNumber !== nextPage.pageNumber
      );
      return {
        ...prev,
        pages: [...others, nextPage].sort(
          (a, b) => a.pageNumber - b.pageNumber
        ),
      };
    });
  };

  const handleToggleBookmark = async () => {
    const nextBookmark = !currentPageData.bookmark;

    try {
      const saved = await upsertPatternPage(pattern.id, currentPage, {
        bookmark: nextBookmark,
        memo: currentPageData.memo,
      });
      updateLocalPage(saved);
      showSuccessToast(
        nextBookmark ? "북마크를 추가했어요" : "북마크를 해제했어요"
      );
    } catch (error) {
      showNetworkErrorToast(error, "북마크를 저장하지 못했어요");
    }
  };

  const handleSaveMemo = async (memo: string) => {
    try {
      const saved = await upsertPatternPage(pattern.id, currentPage, {
        bookmark: currentPageData.bookmark,
        memo,
      });
      updateLocalPage(saved);
      showSuccessToast("메모를 저장했어요");
    } catch (error) {
      showNetworkErrorToast(error, "메모를 저장하지 못했어요");
      throw error;
    }
  };

  const handleToggleFullscreen = async () => {
    const element = viewerRef.current;
    if (!element) {
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await element.requestFullscreen();
      }
    } catch (error) {
      showNetworkErrorToast(error, "전체 화면을 사용할 수 없어요");
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `"${pattern.title}" 도안을 삭제할까요? PDF와 메모도 함께 삭제돼요.`
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePattern(pattern.id, pattern.pdfStoragePath);
      showSuccessToast("도안을 삭제했어요");
      router.push("/patterns");
      router.refresh();
    } catch (error) {
      showNetworkErrorToast(error, "도안을 삭제하지 못했어요");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          nativeButton={false}
          render={<Link href="/patterns" />}
        >
          <ChevronLeft data-icon="inline-start" />
          목록
        </Button>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsProjectDialogOpen(true)}
          >
            <Sparkles data-icon="inline-start" />
            작품 시작
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
            aria-label="도안 삭제"
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      {loadError ? (
        <ErrorState
          title="도안을 표시하지 못했어요"
          message={loadError}
          onRetry={() => void reloadPattern()}
        />
      ) : null}

      {!pattern.pdfUrl ? (
        <ErrorState
          title="PDF 파일이 없어요"
          message="도안 PDF를 찾을 수 없어요. 다시 업로드해 주세요."
          onRetry={() => void reloadPattern()}
        />
      ) : (
        <div
          ref={viewerRef}
          className="-mx-4 overflow-hidden rounded-xl ring-1 ring-foreground/10"
        >
          <PatternViewer
            title={pattern.title}
            currentPage={currentPage}
            totalPages={totalPages}
            zoomPercent={zoomPercent}
            onPageChange={setCurrentPage}
            onZoomChange={setZoomPercent}
            onToggleBookmark={() => void handleToggleBookmark()}
            onToggleFullscreen={() => void handleToggleFullscreen()}
            onRename={() => setIsRenameDialogOpen(true)}
            isBookmarked={currentPageData.bookmark}
            isLoading={!totalPages && !loadError}
          >
            <PatternPdfCanvas
              pdfUrl={pattern.pdfUrl}
              pageNumber={currentPage}
              zoomPercent={zoomPercent}
              onDocumentLoad={setTotalPages}
              onLoadError={(error) => {
                if (process.env.NODE_ENV === "development") {
                  console.error("[PDF 로드 실패]", error);
                }
                setLoadError(
                  "PDF를 불러오지 못했어요. 네트워크 상태를 확인해 주세요."
                );
              }}
            />
          </PatternViewer>

          <PatternMemoPanel
            pageNumber={currentPage}
            memo={currentPageData.memo ?? ""}
            onSave={handleSaveMemo}
          />
        </div>
      )}

      <RenamePatternDialog
        patternId={pattern.id}
        currentTitle={pattern.title}
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        onRenamed={(nextTitle) => {
          setPattern((prev) => ({ ...prev, title: nextTitle }));
        }}
      />

      <StartProjectDialog
        patternId={pattern.id}
        defaultTitle={pattern.title}
        open={isProjectDialogOpen}
        onOpenChange={setIsProjectDialogOpen}
      />
    </div>
  );
};

export default PatternDetailScreen;
