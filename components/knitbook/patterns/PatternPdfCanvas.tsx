"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { cn } from "@/lib/utils";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

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
        loading={
          <p className="text-sm text-muted-foreground">PDF를 불러오는 중이에요…</p>
        }
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
          loading={
            <p className="text-sm text-muted-foreground">페이지를 그리는 중…</p>
          }
        />
      </Document>
    </div>
  );
};

export default PatternPdfCanvas;
