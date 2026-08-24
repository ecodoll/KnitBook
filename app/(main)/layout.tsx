import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import AppShell from "@/components/knitbook/layout/AppShell";
import { getAppHeaderUser } from "@/lib/knitbook/app-user";

type AppMainLayoutProps = {
  children: ReactNode;
};

/**
 * 로그인 후 화면의 공통 셸(헤더·하단 내비)을 유지한다.
 */
const AppMainLayout = async ({ children }: AppMainLayoutProps) => {
  const user = await getAppHeaderUser();

  if (!user) {
    redirect("/login");
  }

  return <AppShell user={user}>{children}</AppShell>;
};

export default AppMainLayout;
