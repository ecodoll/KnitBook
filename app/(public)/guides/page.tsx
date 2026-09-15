import type { Metadata } from "next";
import GuideList from "@/components/site/GuideList";

export const metadata: Metadata = {
    title: "뜨개 가이드",
    description:
      "KnitBook 사용법, 게이지, 실 라벨, 도안 보는 법, 작품 기록, 재고 정리, 도안 보관 등 뜨개를 이어 가기 위한 공개 가이드입니다.",
};

/**
 * 로그인 없이 읽을 수 있는 뜨개 가이드 목록이다.
 */
const GuidesPage = () => {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          뜨개 가이드
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          도구를 사기 전에, 또는 작품을 잠시 쉬고 돌아왔을 때 다시 열어 볼 수
          있는 짧은 글입니다. KnitBook 사용법부터 기록과 준비에 필요한 실무까지
          모았고, 도안 판매나 후원 글은 없습니다.
        </p>
      </header>
      <GuideList />
    </div>
  );
};

export default GuidesPage;
