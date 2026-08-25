"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import KnitSpinner from "@/components/knitbook/shared/KnitSpinner";
import { ensurePatternCover } from "@/lib/knitbook/pattern-client";

type PatternCoverProps = {
  patternId: string;
  title: string;
  coverImageUrl?: string;
  pdfStoragePath?: string;
};

/**
 * 저장된 표지를 보여 주고, 없으면 PDF 첫 페이지에서 썸네일을 만든다.
 */
const PatternCover = ({
  patternId,
  title,
  coverImageUrl,
  pdfStoragePath,
}: PatternCoverProps) => {
  const [generatedSrc, setGeneratedSrc] = useState<string>();
  const [didFail, setDidFail] = useState(false);
  const src = coverImageUrl ?? generatedSrc;
  const isGenerating = !src && Boolean(pdfStoragePath) && !didFail;

  useEffect(() => {
    if (src || !pdfStoragePath) {
      return;
    }

    let cancelled = false;

    void ensurePatternCover(patternId, pdfStoragePath)
      .then((url) => {
        if (cancelled) {
          return;
        }
        if (url) {
          setGeneratedSrc(url);
          return;
        }
        setDidFail(true);
      })
      .catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.error("[도안 썸네일 생성 실패]", error);
        }
        if (!cancelled) {
          setDidFail(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [patternId, pdfStoragePath, src]);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- 서명된 스토리지 URL 대응
      <img src={src} alt="" className="size-full object-cover object-top" />
    );
  }

  if (isGenerating) {
    return (
      <KnitSpinner
        className="size-7 text-muted-foreground"
        label={`${title} 썸네일을 만드는 중`}
      />
    );
  }

  return <BookOpen className="size-8 text-muted-foreground" aria-hidden />;
};

export default PatternCover;
