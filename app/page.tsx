import type { Metadata } from "next";
import AppShell from "@/components/knitbook/layout/AppShell";
import HomeDashboard from "@/app/HomeDashboard";

export const metadata: Metadata = {
  title: "홈 | KnitBook",
  description:
    "진행 중인 작품, 최근 도안, 실 재고를 한눈에 보는 KnitBook 홈입니다.",
};

/**
 * KnitBook 메인(홈) 대시보드 페이지이다.
 */
const HomePage = () => {
  return (
    <AppShell>
      <HomeDashboard />
    </AppShell>
  );
};

export default HomePage;
