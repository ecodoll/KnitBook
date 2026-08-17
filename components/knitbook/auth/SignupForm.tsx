"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import ErrorState from "@/components/knitbook/shared/ErrorState";

export type SignupFormValues = {
  email: string;
  nickname: string;
  password: string;
};

type SignupFormProps = {
  onSubmit: (values: SignupFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  /** 폼 상단 브랜드 문구 표시 여부 (페이지에서 로고를 쓸 때는 false) */
  showHeader?: boolean;
};

/**
 * 이메일 회원가입 폼을 렌더링한다.
 */
const SignupForm = ({
  onSubmit,
  isSubmitting = false,
  showHeader = true,
}: SignupFormProps) => {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !nickname.trim() || !password) {
      setErrorMessage("필수 항목을 모두 입력해 주세요.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("이메일 형식을 확인해 주세요.");
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
      await onSubmit({
        email: email.trim(),
        nickname: nickname.trim(),
        password,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[회원가입 실패]", error);
      }
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "회원가입에 실패했어요. 잠시 후 다시 시도해 주세요."
      );
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {showHeader ? (
        <div className="space-y-1 text-center">
          <h1 className="font-heading text-2xl font-semibold">회원가입</h1>
          <p className="text-sm text-muted-foreground">
            도안·작품·실을 한곳에서 시작해 보세요
          </p>
        </div>
      ) : null}

      {errorMessage ? (
        <ErrorState title="가입을 완료하지 못했어요" message={errorMessage} />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="signup-email">이메일</Label>
        <Input
          id="signup-email"
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
        <Label htmlFor="signup-nickname">닉네임</Label>
        <Input
          id="signup-nickname"
          autoComplete="nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="뜨개 닉네임"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">비밀번호</Label>
        <Input
          id="signup-password"
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
        <Label htmlFor="signup-password-confirm">비밀번호 확인</Label>
        <Input
          id="signup-password-confirm"
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
            가입 중…
          </>
        ) : (
          "가입하기"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
};

export default SignupForm;
