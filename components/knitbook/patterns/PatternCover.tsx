"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import KnitSpinner from "@/components/knitbook/shared/KnitSpinner";
import { cn } from "@/lib/utils";
import {
  ensurePatternCover,
  resolvePatternCoverUrl,
} from "@/lib/knitbook/pattern-client";

type PatternCoverProps = {
  patternId: string;
  title: string;
  coverImageUrl?: string;
  coverStoragePath?: string;
  pdfStoragePath?: string;
  /** 홈 등 작은 썸네일용 아이콘 크기 */
  compact?: boolean;
};

/**
 * 저장된 표지를 보여 주고, 없으면 PDF 첫 페이지에서 썸네일을 만든다.
 */
const PatternCover = ({
  patternId,
  title,
  coverImageUrl,
  coverStoragePath,
  pdfStoragePath,
  compact = false,
}: PatternCoverProps) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>();
  const [didFail, setDidFail] = useState(false);
  const src = coverImageUrl ?? resolvedSrc;
  const isGenerating = !src && Boolean(coverStoragePath || pdfStoragePath) && !didFail;

  useEffect(() => {
    if (coverImageUrl) {
      return;
    }

    let cancelled = false;

    const resolveCover = async () => {
      try {
        if (coverStoragePath) {
          const signed = await resolvePatternCoverUrl(coverStoragePath);
          if (cancelled) {
            return;
          }
          if (signed) {
            setResolvedSrc(signed);
            return;
          }
        }

        if (pdfStoragePath) {
          const generated = await ensurePatternCover(patternId, pdfStoragePath);
          if (cancelled) {
            return;
          }
          if (generated) {
            setResolvedSrc(generated);
            return;
          }
        }

        if (!cancelled) {
          setDidFail(true);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[도안 썸네일 표시 실패]", error);
        }
        if (!cancelled) {
          setDidFail(true);
        }
      }
    };

    void resolveCover();

    return () => {
      cancelled = true;
    };
  }, [patternId, coverImageUrl, coverStoragePath, pdfStoragePath]);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- 서명된 스토리지 URL 대응
      <img src={src} alt="" className="size-full object-cover object-top" />
    );
  }

  if (isGenerating) {
    return (
      <KnitSpinner
        className={cn("text-muted-foreground", compact ? "size-5" : "size-7")}
        label={`${title} 썸네일을 만드는 중`}
      />
    );
  }

  return (
    <BookOpen
      className={cn("text-muted-foreground", compact ? "size-5" : "size-8")}
      aria-hidden
    />
  );
};

export default PatternCover;
