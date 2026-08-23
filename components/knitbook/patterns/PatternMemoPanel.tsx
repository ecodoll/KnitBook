"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type PatternMemoPanelProps = {
  pageNumber: number;
  memo: string;
  onSave: (memo: string) => Promise<void>;
  className?: string;
};

/**
 * 현재 PDF 페이지에 대한 메모 입력·저장 UI를 제공한다.
 */
const PatternMemoPanel = ({
  pageNumber,
  memo,
  onSave,
  className,
}: PatternMemoPanelProps) => {
  const [draft, setDraft] = useState(memo);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(memo);
  }, [memo, pageNumber]);

  const handleBlur = async () => {
    if (draft === memo) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(draft);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      className={cn("space-y-2 border-t border-border bg-card px-3 py-3", className)}
      aria-label={`${pageNumber}페이지 메모`}
    >
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={`pattern-memo-${pageNumber}`} className="text-sm">
          {pageNumber}페이지 메모
        </Label>
        {isSaving ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Spinner className="size-3" />
            저장 중…
          </span>
        ) : null}
      </div>
      <Textarea
        id={`pattern-memo-${pageNumber}`}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => void handleBlur()}
        placeholder="이 페이지에 메모를 남겨 보세요."
        rows={3}
        disabled={isSaving}
      />
    </section>
  );
};

export default PatternMemoPanel;
