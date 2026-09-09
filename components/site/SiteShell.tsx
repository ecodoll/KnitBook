import type { ReactNode } from "react";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";

type SiteShellProps = {
  children: ReactNode;
};

/**
 * 공개 페이지의 헤더·본문·푸터 뼈대를 구성한다.
 */
const SiteShell = ({ children }: SiteShellProps) => {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
      <SiteFooter />
    </div>
  );
};

export default SiteShell;
