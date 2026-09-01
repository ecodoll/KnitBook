"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import ErrorState from "@/components/knitbook/shared/ErrorState";

type YarnStockAdjustFormProps = {
  remainingGrams?: number;
  onSubmit: (grams: number) => Promise<void> | void;
  isSubmitting?: boolean;
};

/**
 * 사용한 실 중량을 남은 재고에서 차감한다.
 */
const YarnStockAdjustForm = ({
  remainingGrams,
  onSubmit,
  isSubmitting = false,
}: YarnStockAdjustFormProps) => {
  const [grams, setGrams] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = Number(grams);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setErrorMessage("차감할 중량을 0보다 크게 입력해 주세요.");
      return;
    }

    try {
      await onSubmit(parsed);
      setGrams("");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[재고 차감 실패]", error);
      }
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "재고를 차감하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      {errorMessage ? <ErrorState title="확인이 필요해요" message={errorMessage} /> : null}

      <p className="text-sm text-muted-foreground">
        {typeof remainingGrams === "number"
          ? `현재 남은 양 ${remainingGrams}g`
          : "남은 중량이 아직 없어요. 수정에서 먼저 입력해 주세요."}
      </p>

      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="yarn-deduct">차감할 중량 (g)</Label>
          <Input
            id="yarn-deduct"
            type="number"
            min={0}
            step="0.1"
            inputMode="decimal"
            value={grams}
            onChange={(event) => setGrams(event.target.value)}
            placeholder="예: 20"
            disabled={isSubmitting || typeof remainingGrams !== "number"}
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          disabled={isSubmitting || typeof remainingGrams !== "number"}
        >
          {isSubmitting ? (
            <>
              <Spinner data-icon="inline-start" />
              차감 중…
            </>
          ) : (
            "재고 차감"
          )}
        </Button>
      </div>
    </form>
  );
};

export default YarnStockAdjustForm;
