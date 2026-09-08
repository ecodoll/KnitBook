"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import RowCounter from "@/components/knitbook/projects/RowCounter";
import StorageImage from "@/components/knitbook/shared/StorageImage";
import { resolveProjectImageUrl } from "@/lib/knitbook/project-client";
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
  initialLoggedOn?: string;
  initialRow?: number;
  initialPercent?: number;
  initialMemo?: string;
  existingPhotoUrl?: string;
  existingPhotoStoragePath?: string;
  onSubmit: (values: QuickLogValues) => Promise<void> | void;
  onCancel?: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  submitLabel?: string;
  eyebrow?: string;
  /** 같은 화면에 폼이 둘일 때 input id가 겹치지 않게 한다. */
  idPrefix?: string;
};

/**
 * 날짜 값을 type=date 입력에 맞는 YYYY-MM-DD로 맞춘다.
 */
const toDateInputValue = (value?: string) => {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
};

/**
 * 단수·사진·메모로 작업 기록을 남기거나 고친다.
 */
const QuickLogForm = ({
  projectTitle,
  initialLoggedOn,
  initialRow,
  initialPercent,
  initialMemo = "",
  existingPhotoUrl,
  existingPhotoStoragePath,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting = false,
  isDeleting = false,
  submitLabel = "기록 저장",
  eyebrow = "작업 기록",
  idPrefix = "log",
}: QuickLogFormProps) => {
  const [loggedOn, setLoggedOn] = useState(() => toDateInputValue(initialLoggedOn));
  const [currentRow, setCurrentRow] = useState(
    typeof initialRow === "number" ? initialRow : 0
  );
  const [memo, setMemo] = useState(initialMemo);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const previewRef = useRef<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isBusy = isSubmitting || isDeleting;
  const dateId = `${idPrefix}-date`;
  const photoId = `${idPrefix}-photo`;
  const memoId = `${idPrefix}-memo`;

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

    if (!loggedOn) {
      setErrorMessage("기록 날짜를 선택해 주세요.");
      return;
    }

    try {
      await onSubmit({
        loggedOn,
        currentRow,
        progressPercent:
          typeof initialPercent === "number" ? initialPercent : null,
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

  const handleDelete = async () => {
    if (!onDelete) {
      return;
    }

    setErrorMessage(null);
    try {
      await onDelete();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[작업 기록 삭제 실패]", error);
      }
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "기록을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{eyebrow}</p>
        <h2 className="text-lg font-medium break-keep">{projectTitle}</h2>
      </div>

      {errorMessage ? <ErrorState title="확인이 필요해요" message={errorMessage} /> : null}

      <div className="space-y-2">
        <Label htmlFor={dateId}>날짜</Label>
        <Input
          id={dateId}
          type="date"
          value={loggedOn}
          onChange={(event) => setLoggedOn(event.target.value)}
          disabled={isBusy}
        />
      </div>

      <RowCounter
        idPrefix={idPrefix}
        value={currentRow}
        onChange={setCurrentRow}
        disabled={isBusy}
      />

      <div className="space-y-2">
        <Label htmlFor={photoId}>사진</Label>
        {previewUrl ? (
          <div className="overflow-hidden rounded-lg bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element -- 미리보기 URL 대응 */}
            <img
              src={previewUrl}
              alt=""
              className="aspect-square w-full object-cover"
            />
          </div>
        ) : existingPhotoUrl || existingPhotoStoragePath ? (
          <div className="overflow-hidden rounded-lg bg-secondary">
            <StorageImage
              src={existingPhotoUrl}
              storagePath={existingPhotoStoragePath}
              resolveUrl={resolveProjectImageUrl}
              alt=""
              className="aspect-square w-full object-cover"
              fallback={null}
            />
          </div>
        ) : null}
        <Input
          id={photoId}
          type="file"
          accept={YARN_IMAGE_ACCEPT}
          onChange={(event) => {
            replacePhoto(event.target.files?.[0] ?? null);
          }}
          disabled={isBusy}
        />
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP 사진을 올릴 수 있어요. 휴대폰 사진은 자동으로 줄여 저장해요.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={memoId}>메모</Label>
        <Textarea
          id={memoId}
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          placeholder="예: 소매 부분 시작"
          disabled={isBusy}
        />
      </div>

      <div className="flex gap-2">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isBusy}
          >
            취소
          </Button>
        ) : null}
        <Button type="submit" className="flex-1" disabled={isBusy}>
          {isSubmitting ? (
            <>
              <Spinner data-icon="inline-start" />
              저장 중…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>

      {onDelete ? (
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          onClick={() => {
            void handleDelete();
          }}
          disabled={isBusy}
        >
          {isDeleting ? (
            <>
              <Spinner data-icon="inline-start" />
              삭제 중…
            </>
          ) : (
            "기록 삭제"
          )}
        </Button>
      ) : null}
    </form>
  );
};

export default QuickLogForm;
