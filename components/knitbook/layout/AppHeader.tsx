"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import AppHeaderBrand from "@/components/knitbook/layout/AppHeaderBrand";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";

export type AppHeaderUser = {
  nickname: string;
  email?: string;
};

type AppHeaderProps = {
  user: AppHeaderUser;
};

/**
 * 앱 상단 헤더(로고·프로필 메뉴)를 렌더링한다.
 */
const AppHeader = ({ user }: AppHeaderProps) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[로그아웃 실패]", error);
      }
      setErrorMessage("로그아웃하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const initial = user.nickname.trim().slice(0, 1) || "?";
  const email = user.email?.trim() || "이메일 없음";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-3 px-4">
        <AppHeaderBrand />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer rounded-full"
                aria-label={`${user.nickname} 프로필 메뉴`}
              />
            }
          >
            <Avatar size="sm">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-56 p-3">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="space-y-0.5 px-0 text-foreground">
                  <span className="block truncate text-sm font-medium">
                    {user.nickname}
                  </span>
                  <span className="block truncate text-sm font-normal text-muted-foreground">
                    {email}
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
            <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
              <Link
                href="/privacy"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/terms"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                이용약관
              </Link>
              <Link
                href="/guides"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                뜨개 가이드
              </Link>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="mt-3 w-full"
              disabled={isLoggingOut}
              onClick={() => {
                void handleLogout();
              }}
            >
              {isLoggingOut ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <LogOut data-icon="inline-start" />
              )}
              로그아웃
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
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
