"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Yarn } from "@/components/knitbook/types";
import { YARN_IMAGE_ACCEPT } from "@/lib/knitbook/yarns/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import ErrorState from "@/components/knitbook/shared/ErrorState";

export type YarnFormValues = {
  productName: string;
  brand: string;
  colorName: string;
  productCode: string;
  weightGrams: string;
  remainingGrams: string;
  memo: string;
  photo: File | null;
};

type YarnFormProps = {
  initialValues?: Partial<YarnFormValues>;
  currentImageUrl?: string;
  onSubmit: (values: YarnFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

const EMPTY_VALUES: YarnFormValues = {
  productName: "",
  brand: "",
  colorName: "",
  productCode: "",
  weightGrams: "",
  remainingGrams: "",
  memo: "",
  photo: null,
};

/**
 * Yarn 도메인 값을 폼 입력 문자열로 변환한다.
 */
const yarnToFormValues = (yarn: Yarn): YarnFormValues => {
  return {
    productName: yarn.productName,
    brand: yarn.brand,
    colorName: yarn.colorName ?? "",
    productCode: yarn.productCode ?? "",
    weightGrams: yarn.weightGrams?.toString() ?? "",
    remainingGrams: yarn.remainingGrams?.toString() ?? "",
    memo: yarn.notes ?? "",
    photo: null,
  };
};

/**
 * 실 이름·브랜드·색깔·제품번호·무게와 사진을 입력한다.
 */
const YarnForm = ({
  initialValues,
  currentImageUrl,
  onSubmit,
  isSubmitting = false,
  submitLabel = "실 저장",
}: YarnFormProps) => {
  const [values, setValues] = useState<YarnFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
    photo: null,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | undefined>();
  const localPreviewRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
      }
    };
  }, []);

  /**
   * 선택한 사진의 미리보기 URL을 갱신한다.
   */
  const replacePhoto = (file: File | null) => {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = undefined;
    }

    const nextUrl = file ? URL.createObjectURL(file) : undefined;
    localPreviewRef.current = nextUrl;
    setLocalPreviewUrl(nextUrl);
    setValues((prev) => ({ ...prev, photo: file }));
  };

  const previewUrl = localPreviewUrl ?? currentImageUrl;

  const updateField = (
    key: Exclude<keyof YarnFormValues, "photo">,
    value: string
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * 무게를 바꾸면, 남은 무게가 비어 있거나 이전 무게와 같았던 경우에만 맞춰 준다.
   */
  const updateWeightGrams = (value: string) => {
    setValues((prev) => ({
      ...prev,
      weightGrams: value,
      remainingGrams:
        prev.remainingGrams === "" || prev.remainingGrams === prev.weightGrams
          ? value
          : prev.remainingGrams,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!values.productName.trim() || !values.brand.trim()) {
      setErrorMessage("실 이름과 브랜드는 필수예요.");
      return;
    }

    try {
      await onSubmit({
        ...values,
        productName: values.productName.trim(),
        brand: values.brand.trim(),
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[실 저장 실패]", error);
      }
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "실 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {errorMessage ? <ErrorState title="확인이 필요해요" message={errorMessage} /> : null}

      <div className="space-y-2">
        <Label htmlFor="yarn-photo">실 사진</Label>
        {previewUrl ? (
          <div className="overflow-hidden rounded-lg bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element -- 미리보기·스토리지 URL 대응 */}
            <img
              src={previewUrl}
              alt=""
              className="aspect-square w-full object-cover"
            />
          </div>
        ) : null}
        <Input
          id="yarn-photo"
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
        <Label htmlFor="yarn-name">실 이름</Label>
        <Input
          id="yarn-name"
          value={values.productName}
          onChange={(event) => updateField("productName", event.target.value)}
          placeholder="예: Alaska"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="yarn-brand">브랜드</Label>
        <Input
          id="yarn-brand"
          value={values.brand}
          onChange={(event) => updateField("brand", event.target.value)}
          placeholder="예: Drops"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="yarn-color">색깔</Label>
          <Input
            id="yarn-color"
            value={values.colorName}
            onChange={(event) => updateField("colorName", event.target.value)}
            placeholder="예: Grey"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yarn-code">제품번호</Label>
          <Input
            id="yarn-code"
            value={values.productCode}
            onChange={(event) => updateField("productCode", event.target.value)}
            placeholder="예: 1001"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="yarn-weight">무게 (g)</Label>
          <Input
            id="yarn-weight"
            type="number"
            min={0}
            inputMode="decimal"
            value={values.weightGrams}
            onChange={(event) => updateWeightGrams(event.target.value)}
            placeholder="예: 100"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yarn-remaining">남은 무게 (g)</Label>
          <Input
            id="yarn-remaining"
            type="number"
            min={0}
            inputMode="decimal"
            value={values.remainingGrams}
            onChange={(event) => updateField("remainingGrams", event.target.value)}
            placeholder="예: 80"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="yarn-memo">메모</Label>
        <Textarea
          id="yarn-memo"
          value={values.memo}
          onChange={(event) => updateField("memo", event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner data-icon="inline-start" />
            저장 중…
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
};

export { yarnToFormValues };
export default YarnForm;
