import type { ReactNode } from "react";
import BottomNav from "@/components/knitbook/layout/BottomNav";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  /** 하단 네비게이션 표시 여부 */
  showBottomNav?: boolean;
  className?: string;
};

/**
 * KnitBook 모바일 우선 앱 셸(본문 + 하단 네비)을 구성한다.
 */
const AppShell = ({
  children,
  showBottomNav = true,
  className,
}: AppShellProps) => {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
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
