"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/** 주소창 높이 변화와 키보드를 구분하는 최소 겹침(px) */
const KEYBOARD_OVERLAP_THRESHOLD = 80;

type PatternMemoPanelProps = {
  pageNumber: number;
  memo: string;
  onSave: (memo: string, pageNumber: number) => Promise<void>;
  className?: string;
};

/**
 * 메모 칸 아래가 키보드에 가려지면 문서 아래로 여백을 넣고 칸이 보이게 스크롤한다.
 */
const scrollMemoAboveKeyboard = (section: HTMLElement) => {
  const viewport = window.visualViewport;
  if (!viewport) {
    section.scrollIntoView({ block: "nearest", inline: "nearest" });
    return;
  }

  const rect = section.getBoundingClientRect();
  const padding = 12;
  const headerOffset = 64;
  // getBoundingClientRect는 레이아웃 뷰포트 기준이라 시각적 위치로 보정한다.
  const topInVisual = rect.top - viewport.offsetTop;
  const bottomInVisual = rect.bottom - viewport.offsetTop;
  const visibleBottom = viewport.height - padding;
  const available = visibleBottom - headerOffset;

  if (rect.height <= available) {
    const delta =
      bottomInVisual > visibleBottom + 1
        ? bottomInVisual - visibleBottom
        : topInVisual < headerOffset - 1
          ? topInVisual - headerOffset
          : 0;

    if (Math.abs(delta) > 1) {
      window.scrollBy({ top: delta });
    }
    return;
  }

  if (bottomInVisual > visibleBottom + 1) {
    window.scrollBy({ top: bottomInVisual - visibleBottom });
  }
};

/**
 * 키보드가 차지한 높이(px)를 계산한다. 레이아웃이 이미 줄어든 경우 0이다.
 */
const measureKeyboardOverlap = () => {
  const viewport = window.visualViewport;
  if (!viewport) {
    return 0;
  }

  return Math.max(
    0,
    Math.round(window.innerHeight - viewport.height - viewport.offsetTop),
  );
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
  const [source, setSource] = useState({ pageNumber, memo });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [keyboardSpacer, setKeyboardSpacer] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savingRef = useRef(false);

  if (pageNumber !== source.pageNumber || memo !== source.memo) {
    setSource({ pageNumber, memo });
    setDraft(memo);
    setSaveError(null);
  }

  /**
   * 변경된 메모를 현재 페이지에 저장한다.
   */
  const persist = async (value: string, options?: { blur?: boolean }) => {
    if (savingRef.current || value === memo) {
      return;
    }

    savingRef.current = true;
    setIsSaving(true);
    setSaveError(null);

    try {
      await onSave(value, pageNumber);
      if (options?.blur) {
        textareaRef.current?.blur();
      }
    } catch {
      setSaveError("메모를 저장하지 못했어요. 다시 눌러 주세요.");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    const section = sectionRef.current;
    const spacer = spacerRef.current;
    if (!textarea || !section || !spacer) {
      return;
    }

    let frameId = 0;
    const timers: number[] = [];

    const clearTimers = () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
      timers.length = 0;
    };

    /**
     * 포커스된 메모 칸이 키보드 위에 오도록 여백과 스크롤을 맞춘다.
     */
    const align = () => {
      const focused = document.activeElement === textarea;
      if (!focused) {
        spacer.style.height = "0px";
        setKeyboardSpacer(0);
        return;
      }

      const overlap = measureKeyboardOverlap();
      const spacerHeight =
        overlap > KEYBOARD_OVERLAP_THRESHOLD ? overlap + 16 : 0;
      spacer.style.height = `${spacerHeight}px`;
      setKeyboardSpacer((current) =>
        current === spacerHeight ? current : spacerHeight,
      );
      // 여백이 스크롤 높이에 반영된 뒤 위치를 잰다.
      void spacer.offsetHeight;
      scrollMemoAboveKeyboard(section);
    };

    const schedule = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(align);
    };

    const onFocus = () => {
      clearTimers();
      schedule();
      for (const delay of [50, 250, 500]) {
        timers.push(window.setTimeout(schedule, delay));
      }
    };

    const onBlur = () => {
      clearTimers();
      cancelAnimationFrame(frameId);
      spacer.style.height = "0px";
      setKeyboardSpacer(0);
    };

    const viewport = window.visualViewport;
    textarea.addEventListener("focus", onFocus);
    textarea.addEventListener("blur", onBlur);
    textarea.addEventListener("input", schedule);
    viewport?.addEventListener("resize", schedule);
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimers();
      textarea.removeEventListener("focus", onFocus);
      textarea.removeEventListener("blur", onBlur);
      textarea.removeEventListener("input", schedule);
      viewport?.removeEventListener("resize", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, []);

  const isDirty = draft !== memo;

  return (
    <>
      <section
        ref={sectionRef}
        className={cn(
          "scroll-mb-3 space-y-2 border-t border-border bg-card px-3 py-3",
          className,
        )}
        aria-label={`${pageNumber}페이지 메모`}
      >
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={`pattern-memo-${pageNumber}`} className="text-sm">
            {pageNumber}페이지 메모
          </Label>
          <Button
            type="button"
            size="sm"
            className="h-9 min-w-16 shrink-0 px-3"
            variant={isDirty ? "default" : "outline"}
            disabled={!isDirty || isSaving}
            onPointerDown={(event) => {
              // 마우스로 누르면 포커스가 빠져 저장 클릭이 취소된다. 터치는 blur로 저장한다.
              if (event.pointerType === "mouse") {
                event.preventDefault();
              }
            }}
            onClick={() => {
              void persist(textareaRef.current?.value ?? draft, { blur: true });
            }}
          >
            {isSaving ? (
              <>
                <Spinner data-icon="inline-start" />
                저장 중…
              </>
            ) : (
              "저장"
            )}
          </Button>
        </div>
        <Textarea
          ref={textareaRef}
          id={`pattern-memo-${pageNumber}`}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            if (saveError) {
              setSaveError(null);
            }
          }}
          onBlur={(event) => {
            void persist(event.currentTarget.value);
          }}
          placeholder="이 페이지에 메모를 남겨 보세요."
          rows={3}
          disabled={isSaving}
          className="max-h-40 overflow-y-auto"
        />
        {saveError ? (
          <p className="text-sm text-destructive" role="alert">
            {saveError}
          </p>
        ) : null}
      </section>
      <div
        ref={spacerRef}
        aria-hidden
        style={{ height: keyboardSpacer }}
      />
    </>
  );
};

export default PatternMemoPanel;
