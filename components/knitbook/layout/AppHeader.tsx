"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import KnitBookLogo from "@/components/knitbook/auth/KnitBookLogo";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export type AppHeaderUser = {
  nickname: string;
  email?: string;
};

type AppHeaderProps = {
  user?: AppHeaderUser;
};

/** Auth 연동 전 헤더에 보여줄 임시 로그인 사용자 */
export const SAMPLE_HEADER_USER: AppHeaderUser = {
  nickname: "뜨개인",
  email: "knitter@example.com",
};

/**
 * 앱 상단 헤더(로고·로그인 사용자·로그아웃)를 렌더링한다.
 */
const AppHeader = ({ user = SAMPLE_HEADER_USER }: AppHeaderProps) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setErrorMessage(null);

    try {
      // TODO: Supabase Auth 연동
      if (process.env.NODE_ENV === "development") {
        console.info("[로그아웃 시도]", { nickname: user.nickname });
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
      router.push("/login");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[로그아웃 실패]", error);
      }
      setErrorMessage("로그아웃하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const initial = user.nickname.trim().slice(0, 1) || "뜨";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-3 px-4">
        <KnitBookLogo variant="inline" />

        <div className="flex min-w-0 items-center gap-2">
          <div
            className="flex min-w-0 items-center gap-2"
            title={user.email}
            aria-label={`${user.nickname}으로 로그인 중`}
          >
            <Avatar size="sm" aria-hidden>
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <p className="truncate text-sm font-medium text-foreground">
              {user.nickname}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="로그아웃"
          >
            {isLoggingOut ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <LogOut data-icon="inline-start" />
            )}
            로그아웃
          </Button>
        </div>
      </div>

      {errorMessage ? (
        <div className="mx-auto max-w-lg px-4 pb-3">
          <ErrorState title="로그아웃할 수 없어요" message={errorMessage} />
        </div>
      ) : null}
    </header>
  );
};

export default AppHeader;
