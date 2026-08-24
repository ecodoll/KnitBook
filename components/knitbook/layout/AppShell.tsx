"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AppHeader, {
  type AppHeaderUser,
} from "@/components/knitbook/layout/AppHeader";
import BottomNav from "@/components/knitbook/layout/BottomNav";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  /** 상단 헤더 표시 여부 */
  showHeader?: boolean;
  /** 하단 네비게이션 표시 여부. 생략 시 도안 뷰어에서는 숨긴다. */
  showBottomNav?: boolean;
  /** 헤더에 표시할 로그인 사용자 */
  user?: AppHeaderUser;
  className?: string;
};

/**
 * 도안 상세(뷰어) 경로인지 판별한다.
 */
const isPatternViewerPath = (pathname: string) => {
  return (
    /^\/patterns\/[^/]+\/?$/.test(pathname) &&
    !pathname.startsWith("/patterns/new")
  );
};

/**
 * KnitBook 모바일 우선 앱 셸(헤더 + 본문 + 하단 네비)을 구성한다.
 */
const AppShell = ({
  children,
  showHeader = true,
  showBottomNav,
  user,
  className,
}: AppShellProps) => {
  const pathname = usePathname();
  const displayBottomNav = showBottomNav ?? !isPatternViewerPath(pathname);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      {showHeader && user ? <AppHeader user={user} /> : null}
      <main
        className={cn(
          "mx-auto w-full max-w-lg flex-1 px-4 pt-4",
          displayBottomNav ? "pb-24" : "pb-8",
          className
        )}
      >
        {children}
      </main>
      {displayBottomNav ? <BottomNav /> : null}
    </div>
  );
};

export default AppShell;
