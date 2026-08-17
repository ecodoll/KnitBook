"use client";

import { useState } from "react";
import Link from "next/link";
import KnitBookLogo from "@/components/knitbook/auth/KnitBookLogo";
import SignupForm, {
  type SignupFormValues,
} from "@/components/knitbook/auth/SignupForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * 회원가입 화면 본문(로고·소개·폼·가입 완료)을 구성한다.
 */
const SignupScreen = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSignup = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      // TODO: Supabase Auth 연동
      if (process.env.NODE_ENV === "development") {
        console.info("[회원가입 시도]", {
          email: values.email,
          nickname: values.nickname,
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
      setIsComplete(true);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[회원가입 실패]", error);
      }
      throw new Error(
        "회원가입에 실패했어요. 잠시 후 다시 시도해 주세요."
      );
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
              {isComplete ? "가입 완료" : "회원가입"}
            </CardTitle>
            <CardDescription>
              {isComplete
                ? "이제 KnitBook에 로그인할 수 있어요."
                : "이메일과 비밀번호로 KnitBook을 시작해 주세요."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isComplete ? (
              <div className="space-y-4 text-center">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  가입이 완료되었어요. 이메일과 비밀번호로 로그인해 주세요.
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
