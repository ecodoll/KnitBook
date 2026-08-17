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
  /** 하단 네비게이션 표시 여부 */
  showBottomNav?: boolean;
  /** 헤더에 표시할 로그인 사용자 */
  user?: AppHeaderUser;
  className?: string;
};

/**
 * KnitBook 모바일 우선 앱 셸(헤더 + 본문 + 하단 네비)을 구성한다.
 */
const AppShell = ({
  children,
  showHeader = true,
  showBottomNav = true,
  user,
  className,
}: AppShellProps) => {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      {showHeader ? <AppHeader user={user} /> : null}
      <main
        className={cn(
          "mx-auto w-full max-w-lg flex-1 px-4 pt-4",
          showBottomNav ? "pb-24" : "pb-8",
          className
        )}
      >
        {children}
      </main>
      {showBottomNav ? <BottomNav /> : null}
    </div>
  );
};

export default AppShell;
