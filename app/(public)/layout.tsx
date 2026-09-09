import type { ReactNode } from "react";
import SiteShell from "@/components/site/SiteShell";

type PublicLayoutProps = {
  children: ReactNode;
};

/**
 * 로그인 없이 볼 수 있는 소개·정책·가이드 페이지의 공통 뼈대다.
 */
const PublicLayout = ({ children }: PublicLayoutProps) => {
  return <SiteShell>{children}</SiteShell>;
};

export default PublicLayout;
