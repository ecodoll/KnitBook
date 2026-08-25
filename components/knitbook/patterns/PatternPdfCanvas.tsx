"use client";

import { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { cn } from "@/lib/utils";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

/** Next.js/Turbopack에서도 안정적으로 로드되도록 public 워커를 사용한다. */
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type PatternPdfCanvasProps = {
  pdfUrl: string;
  pageNumber: number;
  zoomPercent?: number;
  onDocumentLoad?: (totalPages: number) => void;
  onLoadError?: (error: Error) => void;
  className?: string;
};

/**
 * react-pdf로 도안 PDF 한 페이지를 렌더링한다.
 */
const PatternPdfCanvas = ({
  pdfUrl,
  pageNumber,
  zoomPercent = 100,
  onDocumentLoad,
  onLoadError,
  className,
}: PatternPdfCanvasProps) => {
  const [pageWidth, setPageWidth] = useState(320);

  /** 서명 URL에서 Range 요청이 실패하며 무한 로딩되는 것을 막는다. */
  const documentOptions = useMemo(
    () => ({
      disableRange: true,
      disableStream: true,
      disableAutoFetch: true,
      withCredentials: false,
    }),
    []
  );

  useEffect(() => {
    const updateWidth = () => {
      const maxWidth = Math.min(window.innerWidth - 32, 480);
      setPageWidth(Math.round(maxWidth * (zoomPercent / 100)));
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [zoomPercent]);

  return (
    <div className={cn("flex justify-center", className)}>
      <Document
        file={pdfUrl}
        options={documentOptions}
        loading={null}
        error={
          <p className="text-sm text-destructive">
            PDF를 표시하지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        }
        onLoadSuccess={({ numPages }) => onDocumentLoad?.(numPages)}
        onLoadError={(error) => onLoadError?.(error)}
      >
        <Page
          pageNumber={pageNumber}
          width={pageWidth}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={null}
        />
      </Document>
    </div>
  );
};

export default PatternPdfCanvas;
