"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import KnitBookLogo from "@/components/knitbook/auth/KnitBookLogo";
import SignupForm, {
  type SignupFormValues,
} from "@/components/knitbook/auth/SignupForm";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Supabase 회원가입 오류를 사용자용 한글 메시지로 변환한다.
 */
const getSignupErrorMessage = (error: unknown) => {
  const rawMessage =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
      ? error.message
      : "";
  const normalized = rawMessage.toLowerCase();

  if (rawMessage.includes("이미 가입된")) {
    return rawMessage;
  }

  if (
    normalized.includes("already registered") ||
    normalized.includes("already been registered") ||
    normalized.includes("user already exists")
  ) {
    return "이미 가입된 이메일이에요. 로그인해 주세요.";
  }

  if (normalized.includes("password") && normalized.includes("least")) {
    return "비밀번호는 8자 이상으로 입력해 주세요.";
  }

  if (
    normalized.includes("invalid email") ||
    normalized.includes("unable to validate email")
  ) {
    return "이메일 형식을 확인해 주세요.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.";
  }

  return "회원가입에 실패했어요. 잠시 후 다시 시도해 주세요.";
};

/**
 * 회원가입 화면 본문(로고·소개·폼·가입 완료)을 구성한다.
 */
const SignupScreen = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [signedUpEmail, setSignedUpEmail] = useState("");
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  const handleSignup = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            nickname: values.nickname,
          },
        },
      });

      if (error) {
        throw error;
      }

      // 이미 가입된 이메일은 확인 메일 재발송을 숨기기 위해 identities가 비어 있을 수 있다.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error("이미 가입된 이메일이에요. 로그인해 주세요.");
      }

      if (data.session) {
        router.push("/");
        return;
      }

      setSignedUpEmail(values.email);
      setNeedsEmailConfirm(true);
      setIsComplete(true);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[회원가입 실패]", error);
      }
      throw new Error(getSignupErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

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
            흩어진 도안과 실을 모으고, 진행 중인 작품을 기록하는 나만의 뜨개
            공간을 만들어 보세요.
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isComplete
                ? needsEmailConfirm
                  ? "메일 확인"
                  : "가입 완료"
                : "회원가입"}
            </CardTitle>
            <CardDescription>
              {isComplete
                ? needsEmailConfirm
                  ? "가입을 마치려면 메일함의 확인 링크를 눌러 주세요."
                  : "이제 KnitBook에 로그인할 수 있어요."
                : "이메일과 비밀번호로 KnitBook을 시작해 주세요."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isComplete ? (
              <div className="space-y-4 text-center">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {needsEmailConfirm
                    ? `${signedUpEmail}로 확인 메일을 보냈어요. 링크를 누르면 가입이 완료돼요.`
                    : "가입이 완료되었어요. 이메일과 비밀번호로 로그인해 주세요."}
                </p>
                <Button
                  className="w-full"
                  nativeButton={false}
                  render={<Link href="/login" />}
                >
                  로그인하기
                </Button>
              </div>
            ) : (
              <SignupForm
                showHeader={false}
                onSubmit={handleSignup}
                isSubmitting={isSubmitting}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupScreen;
