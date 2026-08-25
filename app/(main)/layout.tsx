import type { ReactNode } from "react";
import { Suspense } from "react";
import AppHeaderFallback from "@/components/knitbook/layout/AppHeaderFallback";
import AppHeaderLoader from "@/components/knitbook/layout/AppHeaderLoader";
import AppShell from "@/components/knitbook/layout/AppShell";

type AppMainLayoutProps = {
  children: ReactNode;
};

/**
 * 로그인 후 화면의 공통 셸(헤더·하단 내비)을 유지한다.
 * 헤더는 Suspense로 분리해 본문·셸이 먼저 그려지게 한다.
 */
const AppMainLayout = ({ children }: AppMainLayoutProps) => {
  return (
    <AppShell
      header={
        <Suspense fallback={<AppHeaderFallback />}>
          <AppHeaderLoader />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
};

export default AppMainLayout;
