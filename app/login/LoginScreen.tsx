"use client";

import { useState } from "react";
import KnitBookLogo from "@/components/knitbook/auth/KnitBookLogo";
import LoginForm, {
  type LoginFormValues,
} from "@/components/knitbook/auth/LoginForm";
import PageLoading from "@/components/knitbook/shared/PageLoading";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Supabase 로그인 오류를 사용자용 한글 메시지로 변환한다.
 */
const getLoginErrorMessage = (error: unknown) => {
  const rawMessage =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
      ? error.message
      : "";
  const normalized = rawMessage.toLowerCase();

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid credentials")
  ) {
    return "이메일 또는 비밀번호가 올바르지 않아요.";
  }

  if (normalized.includes("email not confirmed")) {
    return "이메일 확인이 아직 완료되지 않았어요. 메일함의 확인 링크를 눌러 주세요.";
  }

  if (normalized.includes("too many") || normalized.includes("rate limit")) {
    return "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.";
  }

  return "로그인에 실패했어요. 이메일과 비밀번호를 확인해 주세요.";
};

/**
 * 로그인 화면 본문(로고·소개·폼)을 구성한다.
 */
const LoginScreen = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLogin = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      // 쿠키 세션이 반영된 뒤 한 번에 홈으로 이동해 middleware 바운스를 줄인다.
      await supabase.auth.getSession();
      setIsRedirecting(true);
      window.location.assign("/");
      return;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[로그인 실패]", error);
      }
      setIsSubmitting(false);
      throw new Error(getLoginErrorMessage(error));
    }
  };

  if (isRedirecting) {
    return <PageLoading fullScreen message="KnitBook을 여는 중이에요…" />;
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.935_0.012_152)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.945_0.025_8)_0%,_transparent_40%)]"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <KnitBookLogo />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            도안·작품·실을 한곳에서 관리하고, 지금 뜨고 있는 작품을 기억해 주는
            나만의 뜨개 비서예요.
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">로그인</CardTitle>
            <CardDescription>
              이메일과 비밀번호로 KnitBook에 들어와 주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm
              showHeader={false}
              onSubmit={handleLogin}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;
