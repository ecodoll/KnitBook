"use client";

import { Label } from "@/components/ui/label";

const MIN_ROW = 0;
const MAX_ROW = 9999;

type RowCounterProps = {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  /** 같은 화면에 폼이 둘일 때 레이블 id가 겹치지 않게 한다. */
  idPrefix?: string;
};

/**
 * 귀여운 단추 이미지로 현재 단수를 한 단씩 올리고 내린다.
 */
const RowCounter = ({
  value,
  onChange,
  disabled = false,
  idPrefix = "log",
}: RowCounterProps) => {
  const labelId = `${idPrefix}-row-counter-label`;
  const decrease = () => {
    onChange(Math.max(MIN_ROW, value - 1));
  };

  const increase = () => {
    onChange(Math.min(MAX_ROW, value + 1));
  };

  return (
    <div className="space-y-2">
      <Label id={labelId}>현재 단수</Label>
      <div
        className="flex items-center justify-center gap-3 rounded-xl bg-muted/50 px-2 py-3 sm:gap-5"
        role="group"
        aria-labelledby={labelId}
      >
        <button
          type="button"
          className="size-16 shrink-0 rounded-full p-0 transition-transform outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 disabled:pointer-events-none disabled:opacity-40 sm:size-[4.5rem]"
          onClick={decrease}
          disabled={disabled || value <= MIN_ROW}
          aria-label="한 단 내리기"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 단추 에셋 */}
          <img
            src="/knitbook/row-minus-button.webp"
            alt=""
            width={72}
            height={72}
            className="size-full object-contain"
            draggable={false}
          />
        </button>
        <div className="min-w-[5.5rem] text-center" aria-live="polite">
          <p className="text-3xl leading-none font-semibold tabular-nums tracking-tight">
            {value}
            <span className="ml-0.5 text-base font-medium text-muted-foreground">
              단
            </span>
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">현재까지 진행</p>
        </div>
        <button
          type="button"
          className="size-16 shrink-0 rounded-full p-0 transition-transform outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 disabled:pointer-events-none disabled:opacity-40 sm:size-[4.5rem]"
          onClick={increase}
          disabled={disabled || value >= MAX_ROW}
          aria-label="한 단 올리기"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 단추 에셋 */}
          <img
            src="/knitbook/row-plus-button.webp"
            alt=""
            width={72}
            height={72}
            className="size-full object-contain"
            draggable={false}
          />
        </button>
      </div>
    </div>
  );
};

export default RowCounter;
