"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import ErrorState from "@/components/knitbook/shared/ErrorState";

export type ResetPasswordFormValues = {
  password: string;
};

type ResetPasswordFormProps = {
  onSubmit: (values: ResetPasswordFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
};

/**
 * 새 비밀번호 입력 폼을 렌더링한다.
 */
const ResetPasswordForm = ({
  onSubmit,
  isSubmitting = false,
}: ResetPasswordFormProps) => {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!password) {
      setErrorMessage("새 비밀번호를 입력해 주세요.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("비밀번호는 8자 이상으로 입력해 주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호가 서로 달라요. 다시 확인해 주세요.");
      return;
    }

    try {
      await onSubmit({ password });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[비밀번호 재설정 실패]", error);
      }
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "비밀번호를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요."
      );
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {errorMessage ? (
        <ErrorState title="비밀번호를 바꾸지 못했어요" message={errorMessage} />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="reset-password">새 비밀번호</Label>
        <Input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="8자 이상"
          minLength={8}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-password-confirm">새 비밀번호 확인</Label>
        <Input
          id="reset-password-confirm"
          type="password"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(event) => setPasswordConfirm(event.target.value)}
          placeholder="비밀번호를 한 번 더"
          minLength={8}
          required
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
          "비밀번호 바꾸기"
        )}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
