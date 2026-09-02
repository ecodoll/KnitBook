"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import ErrorState from "@/components/knitbook/shared/ErrorState";

export type QuickLogValues = {
  loggedOn: string;
  currentRow: number | null;
  progressPercent: number | null;
  durationMinutes: number | null;
  memo: string;
};

type QuickLogFormProps = {
  projectTitle: string;
  initialRow?: number;
  initialPercent?: number;
  onSubmit: (values: QuickLogValues) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
};

/**
 * 뜨개를 멈출 때 빠르게 단수·진행률·메모를 기록한다.
 */
const QuickLogForm = ({
  projectTitle,
  initialRow,
  initialPercent,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: QuickLogFormProps) => {
  const [loggedOn, setLoggedOn] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [currentRow, setCurrentRow] = useState(initialRow?.toString() ?? "");
  const [progressPercent, setProgressPercent] = useState(
    initialPercent?.toString() ?? ""
  );
  const [durationMinutes, setDurationMinutes] = useState("");
  const [memo, setMemo] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const rowValue = currentRow ? Number(currentRow) : null;
    const percentValue = progressPercent ? Number(progressPercent) : null;
    const durationValue = durationMinutes ? Number(durationMinutes) : null;

    if (rowValue === null && percentValue === null && !memo.trim()) {
      setErrorMessage("단수, 진행률, 메모 중 하나 이상 입력해 주세요.");
      return;
    }

    if (!loggedOn) {
      setErrorMessage("기록 날짜를 선택해 주세요.");
      return;
    }

    try {
      await onSubmit({
        loggedOn,
        currentRow: Number.isFinite(rowValue) ? rowValue : null,
        progressPercent: Number.isFinite(percentValue) ? percentValue : null,
        durationMinutes: Number.isFinite(durationValue) ? durationValue : null,
        memo: memo.trim(),
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[작업 기록 저장 실패]", error);
      }
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div>
        <p className="text-sm text-muted-foreground">빠른 기록</p>
        <h2 className="text-lg font-medium">{projectTitle}</h2>
      </div>

      {errorMessage ? <ErrorState title="확인이 필요해요" message={errorMessage} /> : null}

      <div className="space-y-2">
        <Label htmlFor="log-date">날짜</Label>
        <Input
          id="log-date"
          type="date"
          value={loggedOn}
          onChange={(event) => setLoggedOn(event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="log-row">현재 단수</Label>
          <Input
            id="log-row"
            type="number"
            min={0}
            inputMode="numeric"
            value={currentRow}
            onChange={(event) => setCurrentRow(event.target.value)}
            placeholder="예: 48"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="log-percent">진행률 (%)</Label>
          <Input
            id="log-percent"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            value={progressPercent}
            onChange={(event) => setProgressPercent(event.target.value)}
            placeholder="예: 42"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="log-duration">오늘 작업 (분)</Label>
        <Input
          id="log-duration"
          type="number"
          min={0}
          inputMode="numeric"
          value={durationMinutes}
          onChange={(event) => setDurationMinutes(event.target.value)}
          placeholder="예: 30"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="log-memo">메모</Label>
        <Textarea
          id="log-memo"
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          placeholder="예: 소매 부분 시작"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-2">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </Button>
        ) : null}
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner data-icon="inline-start" />
              저장 중…
            </>
          ) : (
            "기록 저장"
          )}
        </Button>
      </div>
    </form>
  );
};

export default QuickLogForm;
