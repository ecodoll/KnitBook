"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import ErrorState from "@/components/knitbook/shared/ErrorState";

export type LoginFormValues = {
  email: string;
  password: string;
};

type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  /** 폼 상단 브랜드 문구 표시 여부 (페이지에서 로고를 쓸 때는 false) */
  showHeader?: boolean;
};

/**
 * 이메일·비밀번호 로그인 폼을 렌더링한다.
 */
const LoginForm = ({
  onSubmit,
  isSubmitting = false,
  showHeader = true,
}: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    try {
      await onSubmit({ email: email.trim(), password });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[로그인 실패]", error);
      }
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "로그인에 실패했어요. 이메일과 비밀번호를 확인해 주세요."
      );
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {showHeader ? (
        <div className="space-y-1 text-center">
          <h1 className="font-heading text-2xl font-semibold">KnitBook</h1>
          <p className="text-sm text-muted-foreground">
            나만의 뜨개 비서에 로그인하세요
          </p>
        </div>
      ) : null}

      {errorMessage ? (
        <ErrorState title="로그인할 수 없어요" message={errorMessage} />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="login-email">이메일</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="login-password">비밀번호</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-primary hover:underline"
          >
            비밀번호 찾기
          </Link>
        </div>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner data-icon="inline-start" />
            로그인 중…
          </>
        ) : (
          "로그인"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        계정이 없나요?{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
