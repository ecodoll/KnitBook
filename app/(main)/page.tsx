import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import HomeDashboard from "@/app/HomeDashboard";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import { getHomeDashboardData } from "@/lib/knitbook/home-data";

export const metadata: Metadata = {
  title: "홈 | KnitBook",
  description:
    "진행 중인 작품, 최근 도안, 실 재고를 한눈에 보는 KnitBook 홈입니다.",
};

/**
 * 홈 대시보드 본문을 불러와 렌더한다.
 */
const HomeDashboardLoader = async () => {
  const dashboard = await getHomeDashboardData();

  if (!dashboard) {
    redirect("/login");
  }

  return (
    <HomeDashboard
      nickname={dashboard.user.nickname}
      initialProjects={dashboard.projects}
      initialPatterns={dashboard.patterns}
      initialYarnSummary={dashboard.yarnSummary}
    />
  );
};

/**
 * KnitBook 메인(홈) 대시보드 페이지이다.
 * 셸은 레이아웃에서 먼저 그리고, 본문만 Suspense로 스트리밍한다.
 */
const HomePage = () => {
  return (
    <Suspense fallback={<LoadingState variant="spinner" />}>
      <HomeDashboardLoader />
    </Suspense>
  );
};

export default HomePage;
