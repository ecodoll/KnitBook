import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppShell from "@/components/knitbook/layout/AppShell";
import HomeDashboard from "@/app/HomeDashboard";
import { getHomeDashboardData } from "@/lib/knitbook/home-data";

export const metadata: Metadata = {
  title: "홈 | KnitBook",
  description:
    "진행 중인 작품, 최근 도안, 실 재고를 한눈에 보는 KnitBook 홈입니다.",
};

/**
 * KnitBook 메인(홈) 대시보드 페이지이다.
 */
const HomePage = async () => {
  const dashboard = await getHomeDashboardData();

  if (!dashboard) {
    redirect("/login");
  }

  return (
    <AppShell user={dashboard.user}>
      <HomeDashboard
        nickname={dashboard.user.nickname}
        initialProjects={dashboard.projects}
        initialPatterns={dashboard.patterns}
        initialYarnSummary={dashboard.yarnSummary}
      />
    </AppShell>
  );
};

export default HomePage;
