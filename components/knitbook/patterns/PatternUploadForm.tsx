"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import ErrorState from "@/components/knitbook/shared/ErrorState";

export type PatternUploadValues = {
  title: string;
  designer: string;
  memo: string;
  file: File | null;
};

type PatternUploadFormProps = {
  onSubmit: (values: PatternUploadValues) => Promise<void> | void;
  isSubmitting?: boolean;
};

/**
 * PDF 도안 업로드와 기본 메타데이터 입력을 처리한다.
 */
const PatternUploadForm = ({
  onSubmit,
  isSubmitting = false,
}: PatternUploadFormProps) => {
  const [title, setTitle] = useState("");
  const [designer, setDesigner] = useState("");
  const [memo, setMemo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("도안 이름을 입력해 주세요.");
      return;
    }
    if (!file) {
      setErrorMessage("PDF 파일을 선택해 주세요.");
      return;
    }
    if (file.type !== "application/pdf") {
      setErrorMessage("PDF 파일만 올릴 수 있어요.");
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        designer: designer.trim(),
        memo: memo.trim(),
        file,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[도안 업로드 실패]", error);
      }
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "도안을 올리지 못했어요. 잠시 후 다시 시도해 주세요."
      );
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {errorMessage ? <ErrorState title="확인이 필요해요" message={errorMessage} /> : null}

      <div className="space-y-2">
        <Label htmlFor="pattern-file">PDF 파일</Label>
        <Input
          id="pattern-file"
          type="file"
          accept="application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">모바일에서도 PDF를 바로 볼 수 있어요.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pattern-title">도안 이름</Label>
        <Input
          id="pattern-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="예: Winter Cardigan"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pattern-designer">디자이너 (선택)</Label>
        <Input
          id="pattern-designer"
          value={designer}
          onChange={(event) => setDesigner(event.target.value)}
          placeholder="디자이너 이름"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pattern-memo">메모 (선택)</Label>
        <Textarea
          id="pattern-memo"
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          placeholder="사이즈, 구매처 등"
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner data-icon="inline-start" />
            올리는 중…
          </>
        ) : (
          "도안 저장"
        )}
      </Button>
    </form>
  );
};

export default PatternUploadForm;
