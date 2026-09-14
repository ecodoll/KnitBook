"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import ErrorState from "@/components/knitbook/shared/ErrorState";

export type ForgotPasswordFormValues = {
  email: string;
};

type ForgotPasswordFormProps = {
  onSubmit: (values: ForgotPasswordFormValues) => Promise<void> | void;
  onBackToLogin: () => void;
  isSubmitting?: boolean;
};

/**
 * 비밀번호 재설정 메일 요청 폼을 렌더링한다.
 */
const ForgotPasswordForm = ({
  onSubmit,
  onBackToLogin,
  isSubmitting = false,
}: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("이메일을 입력해 주세요.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("이메일 형식을 확인해 주세요.");
      return;
    }

    try {
      await onSubmit({ email: email.trim() });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[비밀번호 재설정 요청 실패]", error);
      }
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "재설정 메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요."
      );
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {errorMessage ? (
        <ErrorState title="메일을 보내지 못했어요" message={errorMessage} />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="forgot-email">이메일</Label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner data-icon="inline-start" />
            메일 보내는 중…
          </>
        ) : (
          "재설정 메일 보내기"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <button
          type="button"
          className="text-primary font-medium hover:underline"
          onClick={onBackToLogin}
          disabled={isSubmitting}
        >
          로그인으로 돌아가기
        </button>
      </p>
    </form>
  );
};

export default ForgotPasswordForm;
