"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import RowCounter from "@/components/knitbook/projects/RowCounter";
import { buildProgressPercentOptions } from "@/lib/knitbook/projects/constants";
import { YARN_IMAGE_ACCEPT } from "@/lib/knitbook/yarns/constants";

export type QuickLogValues = {
  loggedOn: string;
  currentRow: number | null;
  progressPercent: number | null;
  durationMinutes: number | null;
  memo: string;
  photo: File | null;
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
 * 단수·진행률·사진·메모로 작업 기록을 남긴다.
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
  const [currentRow, setCurrentRow] = useState(
    typeof initialRow === "number" ? initialRow : 0
  );
  const [progressPercent, setProgressPercent] = useState(
    typeof initialPercent === "number" ? String(initialPercent) : "0"
  );
  const [memo, setMemo] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const previewRef = useRef<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const progressOptions = useMemo(
    () => buildProgressPercentOptions(initialPercent),
    [initialPercent]
  );

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  /**
   * 선택한 기록 사진 미리보기를 갱신한다.
   */
  const replacePhoto = (file: File | null) => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = undefined;
    }

    const nextUrl = file ? URL.createObjectURL(file) : undefined;
    previewRef.current = nextUrl;
    setPreviewUrl(nextUrl);
    setPhoto(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const percentValue = progressPercent ? Number(progressPercent) : null;

    if (!loggedOn) {
      setErrorMessage("기록 날짜를 선택해 주세요.");
      return;
    }

    try {
      await onSubmit({
        loggedOn,
        currentRow,
        progressPercent: Number.isFinite(percentValue) ? percentValue : null,
        durationMinutes: null,
        memo: memo.trim(),
        photo,
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">작업 기록</p>
          <h2 className="text-lg font-medium break-keep">{projectTitle}</h2>
        </div>
        <div className="w-[6.75rem] shrink-0 space-y-1.5">
          <Label
            htmlFor="log-percent"
            className="justify-end text-xs text-muted-foreground"
          >
            진행률
          </Label>
          <NativeSelect
            id="log-percent"
            size="sm"
            className="w-full"
            value={progressPercent}
            onChange={(event) => setProgressPercent(event.target.value)}
            disabled={isSubmitting}
            aria-label="진행률"
          >
            {progressOptions.map((percent) => (
              <NativeSelectOption key={percent} value={String(percent)}>
                {percent}%
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
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

      <RowCounter
        value={currentRow}
        onChange={setCurrentRow}
        disabled={isSubmitting}
      />

      <div className="space-y-2">
        <Label htmlFor="log-photo">사진</Label>
        {previewUrl ? (
          <div className="overflow-hidden rounded-lg bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element -- 미리보기 URL 대응 */}
            <img
              src={previewUrl}
              alt=""
              className="aspect-square w-full object-cover"
            />
          </div>
        ) : null}
        <Input
          id="log-photo"
          type="file"
          accept={YARN_IMAGE_ACCEPT}
          onChange={(event) => {
            replacePhoto(event.target.files?.[0] ?? null);
          }}
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP 사진을 올릴 수 있어요. 휴대폰 사진은 자동으로 줄여 저장해요.
        </p>
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
