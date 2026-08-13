"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import KnitBookLogo from "@/components/knitbook/auth/KnitBookLogo";
import LoginForm, {
  type LoginFormValues,
} from "@/components/knitbook/auth/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * 로그인 화면 본문(로고·소개·폼)을 구성한다.
 */
const LoginScreen = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      // TODO: Supabase Auth 연동
      if (process.env.NODE_ENV === "development") {
        console.info("[로그인 시도]", { email: values.email });
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
      router.push("/");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[로그인 실패]", error);
      }
      throw new Error(
        "로그인에 실패했어요. 이메일과 비밀번호를 확인해 주세요."
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
