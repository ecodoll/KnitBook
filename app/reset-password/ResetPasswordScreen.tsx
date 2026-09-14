"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import KnitBookLogo from "@/components/knitbook/auth/KnitBookLogo";
import ResetPasswordForm, {
  type ResetPasswordFormValues,
} from "@/components/knitbook/auth/ResetPasswordForm";
import EmptyState from "@/components/knitbook/shared/EmptyState";
import PageLoading from "@/components/knitbook/shared/PageLoading";
import { updatePasswordAfterReset } from "@/lib/knitbook/profile-client";
import { requireBrowserUser } from "@/lib/knitbook/auth-client";
import { showSuccessToast } from "@/lib/knitbook/use-knitbook-toast";
import { createClient } from "@/lib/supabase/client";
import type { EmailOtpType } from "@supabase/supabase-js";
import SiteFooter from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KeyRound } from "lucide-react";

type ResetView = "loading" | "form" | "invalid" | "redirecting";

/**
 * 재설정 링크로 들어온 사용자가 새 비밀번호를 정하는 화면이다.
 */
const ResetPasswordScreen = () => {
  const [view, setView] = useState<ResetView>("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const ensureSession = async () => {
      try {
        const search = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const code = search.get("code");
        const tokenHash = search.get("token_hash") ?? hash.get("token_hash");
        const type = (search.get("type") ?? hash.get("type")) as EmailOtpType | null;
        const supabase = createClient();

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            throw error;
          }
        } else if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash: tokenHash,
          });
          if (error) {
            throw error;
          }
        }

        await requireBrowserUser();
        if (!cancelled) {
          setView("form");
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[비밀번호 재설정 세션 확인 실패]", error);
        }
        if (!cancelled) {
          setView("invalid");
        }
      }
    };

    void ensureSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleReset = async (values: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await updatePasswordAfterReset(values.password);
      showSuccessToast("비밀번호를 바꿨어요", "새 비밀번호로 들어와 주세요.");
      setView("redirecting");
      window.location.assign("/");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[비밀번호 재설정 실패]", error);
      }
      setIsSubmitting(false);
      throw error;
    }
  };

  if (view === "loading" || view === "redirecting") {
    return <PageLoading fullScreen />;
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.935_0.012_152)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.945_0.025_8)_0%,_transparent_40%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 px-4 py-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <KnitBookLogo />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            새 비밀번호를 정하면 바로 KnitBook을 다시 쓸 수 있어요.
          </p>
        </div>

        {view === "invalid" ? (
          <EmptyState
            icon={<KeyRound />}
            title="재설정 링크를 확인하지 못했어요"
            description="링크가 만료되었거나 이미 사용되었을 수 있어요. 로그인 화면에서 다시 요청해 주세요."
            actionLabel="다시 요청하기"
            actionHref="/login"
          />
        ) : (
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">새 비밀번호</CardTitle>
              <CardDescription>
                앞으로 로그인에 사용할 비밀번호를 입력해 주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResetPasswordForm
                onSubmit={handleReset}
                isSubmitting={isSubmitting}
              />
              <p className="mt-4 text-center text-sm text-muted-foreground">
                <Button
                  variant="link"
                  nativeButton={false}
                  render={<Link href="/login" />}
                  className="h-auto px-0"
                >
                  로그인으로 돌아가기
                </Button>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
