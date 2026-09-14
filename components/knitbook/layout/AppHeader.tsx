"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, UserRound } from "lucide-react";
import AppHeaderBrand from "@/components/knitbook/layout/AppHeaderBrand";
import EditProfileDialog from "@/components/knitbook/profile/EditProfileDialog";
import SettingsDialog from "@/components/knitbook/profile/SettingsDialog";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import StorageImage from "@/components/knitbook/shared/StorageImage";
import { createClient } from "@/lib/supabase/client";
import { isHttpUrl } from "@/lib/knitbook/patterns/signed-url";
import { resolveProfileImageUrl } from "@/lib/knitbook/profile-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";

export type AppHeaderUser = {
  nickname: string;
  email?: string;
  avatarPath?: string;
};

type AppHeaderProps = {
  user: AppHeaderUser;
};

/**
 * 프로필 메뉴를 연 뒤 팝업이 열리도록 한 박자 늦춘다.
 */
const openAfterMenuClose = (open: () => void) => {
  window.setTimeout(open, 0);
};

/**
 * 앱 상단 헤더(로고·프로필 메뉴)를 렌더링한다.
 */
const AppHeader = ({ user }: AppHeaderProps) => {
  const router = useRouter();
  const [optimisticUser, setOptimisticUser] = useState<Pick<
    AppHeaderUser,
    "nickname" | "avatarPath"
  > | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const nickname = optimisticUser?.nickname ?? user.nickname;
  const avatarPath = optimisticUser?.avatarPath ?? user.avatarPath;

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

  const initial = nickname.trim().slice(0, 1) || "?";
  const email = user.email?.trim() || "이메일 없음";
  const avatarSrc = avatarPath && isHttpUrl(avatarPath) ? avatarPath : undefined;
  const avatarStoragePath = avatarSrc ? undefined : avatarPath;

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
                aria-label={`${nickname} 프로필 메뉴`}
              />
            }
          >
            <Avatar size="sm">
              {avatarSrc || avatarStoragePath ? (
                <StorageImage
                  src={avatarSrc}
                  storagePath={avatarStoragePath}
                  resolveUrl={resolveProfileImageUrl}
                  alt=""
                  className="aspect-square size-full rounded-full object-cover"
                  fallback={<AvatarFallback>{initial}</AvatarFallback>}
                />
              ) : (
                <AvatarFallback>{initial}</AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="min-w-56 p-3">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="space-y-0.5 px-0 text-foreground">
                <span className="block truncate text-sm font-medium">
                  {nickname}
                </span>
                <span className="block truncate text-sm font-normal text-muted-foreground">
                  {email}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                openAfterMenuClose(() => setIsEditOpen(true));
              }}
            >
              <UserRound />
              프로필 편집
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                openAfterMenuClose(() => setIsSettingsOpen(true));
              }}
            >
              <Settings />
              설정
            </DropdownMenuItem>
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

      <EditProfileDialog
        open={isEditOpen}
        nickname={nickname}
        avatarPath={avatarPath}
        onOpenChange={setIsEditOpen}
        onUpdated={(next) => {
          setOptimisticUser({
            nickname: next.nickname,
            avatarPath: next.avatarPath,
          });
          router.refresh();
        }}
      />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

      {errorMessage ? (
        <div className="mx-auto max-w-lg px-4 pb-3">
          <ErrorState title="로그아웃할 수 없어요" message={errorMessage} />
        </div>
      ) : null}
    </header>
  );
};

export default AppHeader;
