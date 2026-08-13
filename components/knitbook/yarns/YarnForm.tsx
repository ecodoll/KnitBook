"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import ErrorState from "@/components/knitbook/shared/ErrorState";

export type YarnFormValues = {
  brand: string;
  productName: string;
  colorName: string;
  colorCode: string;
  lotNumber: string;
  fiber: string;
  remainingGrams: string;
  quantity: string;
  yarnWeight: string;
  needleSizeMm: string;
  memo: string;
};

type YarnFormProps = {
  initialValues?: Partial<YarnFormValues>;
  onSubmit: (values: YarnFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

const EMPTY_VALUES: YarnFormValues = {
  brand: "",
  productName: "",
  colorName: "",
  colorCode: "",
  lotNumber: "",
  fiber: "",
  remainingGrams: "",
  quantity: "",
  yarnWeight: "",
  needleSizeMm: "",
  memo: "",
};

/**
 * 실 브랜드·품번·LOT·잔량 등 재고 정보를 입력한다.
 */
const YarnForm = ({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "실 저장",
}: YarnFormProps) => {
  const [values, setValues] = useState<YarnFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField = (key: keyof YarnFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!values.brand.trim() || !values.productName.trim()) {
      setErrorMessage("브랜드와 제품명은 필수예요.");
      return;
    }

    try {
      await onSubmit({
        ...values,
        brand: values.brand.trim(),
        productName: values.productName.trim(),
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

      <div className="grid grid-cols-2 gap-3">
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
        <div className="space-y-2">
          <Label htmlFor="yarn-product">제품명</Label>
          <Input
            id="yarn-product"
            value={values.productName}
            onChange={(event) => updateField("productName", event.target.value)}
            placeholder="예: Alaska"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="yarn-color-name">색상명</Label>
          <Input
            id="yarn-color-name"
            value={values.colorName}
            onChange={(event) => updateField("colorName", event.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yarn-color-code">색상번호</Label>
          <Input
            id="yarn-color-code"
            value={values.colorCode}
            onChange={(event) => updateField("colorCode", event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="yarn-lot">LOT</Label>
          <Input
            id="yarn-lot"
            value={values.lotNumber}
            onChange={(event) => updateField("lotNumber", event.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yarn-fiber">소재</Label>
          <Input
            id="yarn-fiber"
            value={values.fiber}
            onChange={(event) => updateField("fiber", event.target.value)}
            placeholder="울 80% / 나일론 20%"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="yarn-remaining">남은 중량 (g)</Label>
          <Input
            id="yarn-remaining"
            type="number"
            min={0}
            inputMode="numeric"
            value={values.remainingGrams}
            onChange={(event) => updateField("remainingGrams", event.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yarn-quantity">수량 (볼)</Label>
          <Input
            id="yarn-quantity"
            type="number"
            min={0}
            inputMode="numeric"
            value={values.quantity}
            onChange={(event) => updateField("quantity", event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="yarn-weight">굵기</Label>
          <Input
            id="yarn-weight"
            value={values.yarnWeight}
            onChange={(event) => updateField("yarnWeight", event.target.value)}
            placeholder="DK, Worsted…"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yarn-needle">권장 바늘 (mm)</Label>
          <Input
            id="yarn-needle"
            value={values.needleSizeMm}
            onChange={(event) => updateField("needleSizeMm", event.target.value)}
            placeholder="4.0 ~ 5.0"
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

export default YarnForm;
