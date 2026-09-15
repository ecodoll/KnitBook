"use client";

import { useState } from "react";
import KnitBookLogo from "@/components/knitbook/auth/KnitBookLogo";
import ForgotPasswordForm, {
  type ForgotPasswordFormValues,
} from "@/components/knitbook/auth/ForgotPasswordForm";
import LoginForm, {
  type LoginFormValues,
} from "@/components/knitbook/auth/LoginForm";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import PageLoading from "@/components/knitbook/shared/PageLoading";
import { requestPasswordReset } from "@/lib/knitbook/profile-client";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LoginView = "login" | "forgot" | "forgot-sent";

type LoginScreenProps = {
  resetFailed?: boolean;
};

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
 * 로그인 첫 화면 오른쪽에 로고·소개·폼을 구성한다.
 */
const LoginScreen = ({ resetFailed = false }: LoginScreenProps) => {
  const [view, setView] = useState<LoginView>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLinkError, setResetLinkError] = useState(resetFailed);

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

  /**
   * 비밀번호 재설정 안내 메일을 보낸다.
   */
  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await requestPasswordReset(values.email);
      setResetEmail(values.email);
      setView("forgot-sent");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[비밀번호 재설정 요청 실패]", error);
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardTitle =
    view === "login"
      ? "로그인"
      : view === "forgot"
        ? "비밀번호 재설정"
        : "메일을 보냈어요";
  const cardDescription =
    view === "login"
      ? "이메일과 비밀번호로 KnitBook에 들어와 주세요."
      : view === "forgot"
        ? "가입한 이메일을 입력하면 재설정 안내를 보내드려요."
        : "메일함의 링크를 누르면 새 비밀번호를 정할 수 있어요.";

  if (isRedirecting) {
    return <PageLoading fullScreen />;
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 px-4 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <KnitBookLogo />
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          도안·작품·실을 한곳에서 관리하고, 지금 뜨고 있는 작품을 기억해 주는
          나만의 뜨개 비서예요.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {resetLinkError && view === "login" ? (
            <div className="mb-4">
              <ErrorState
                title="재설정 링크를 확인하지 못했어요"
                message="링크가 만료되었거나 이미 사용되었을 수 있어요. 아래에서 다시 요청해 주세요."
              />
            </div>
          ) : null}

          {view === "login" ? (
            <LoginForm
              showHeader={false}
              onSubmit={handleLogin}
              isSubmitting={isSubmitting}
              onForgotPassword={() => {
                setResetLinkError(false);
                setView("forgot");
              }}
            />
          ) : null}

          {view === "forgot" ? (
            <ForgotPasswordForm
              onSubmit={handleForgotPassword}
              onBackToLogin={() => setView("login")}
              isSubmitting={isSubmitting}
            />
          ) : null}

          {view === "forgot-sent" ? (
            <div className="space-y-4 text-center">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {resetEmail}로 재설정 안내를 보냈어요. 메일이 보이지 않으면
                스팸함도 확인해 주세요.
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={() => setView("login")}
              >
                로그인으로 돌아가기
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
