"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import KnitBookLogo from "@/components/knitbook/auth/KnitBookLogo";
import EmptyState from "@/components/knitbook/shared/EmptyState";
import PageLoading from "@/components/knitbook/shared/PageLoading";
import { createClient } from "@/lib/supabase/client";
import { MailWarning } from "lucide-react";

const OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

/**
 * 콜백 다음 경로가 앱 내부 상대 경로인지 확인한다.
 */
const resolveNextPath = (value: string | null) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/reset-password";
  }

  return value;
};

/**
 * URL의 type 값을 Supabase OTP 타입으로 좁힌다.
 */
const resolveOtpType = (value: string | null): EmailOtpType | null => {
  if (!value || !OTP_TYPES.has(value as EmailOtpType)) {
    return null;
  }

  return value as EmailOtpType;
};

/**
 * 메일 인증·비밀번호 재설정 콜백을 처리하고 다음 화면으로 보낸다.
 */
const AuthCallbackScreen = () => {
  const router = useRouter();
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      const search = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const nextPath = resolveNextPath(search.get("next") ?? hash.get("next"));
      const code = search.get("code");
      const tokenHash = search.get("token_hash") ?? hash.get("token_hash");
      const otpType = resolveOtpType(search.get("type") ?? hash.get("type"));
      const supabase = createClient();

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            throw error;
          }
        } else if (tokenHash && otpType) {
          const { error } = await supabase.auth.verifyOtp({
            type: otpType,
            token_hash: tokenHash,
          });
          if (error) {
            throw error;
          }
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) {
            throw new Error("인증 정보를 찾지 못했어요.");
          }
        }

        if (cancelled) {
          return;
        }

        router.replace(nextPath);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[인증 콜백 실패]", error);
        }
        if (!cancelled) {
          setHasFailed(true);
        }
      }
    };

    void finish();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (hasFailed) {
    return (
      <div className="relative flex min-h-full flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.935_0.012_152)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.945_0.025_8)_0%,_transparent_40%)]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 px-4 py-10">
          <KnitBookLogo />
          <EmptyState
            icon={<MailWarning />}
            title="인증을 완료하지 못했어요"
            description="링크가 만료되었거나 이미 사용되었을 수 있어요. 로그인 화면에서 다시 요청해 주세요."
            actionLabel="로그인으로 이동"
            actionHref="/login?reset=failed"
          />
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary font-medium hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return <PageLoading fullScreen />;
};

export default AuthCallbackScreen;
