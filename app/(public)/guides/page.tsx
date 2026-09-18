import type { Metadata } from "next";
import GuideList from "@/components/site/GuideList";

export const metadata: Metadata = {
  title: "뜨개 가이드",
  description:
    "재미있는 뜨개 용어, 뜨개로 만들 수 있는 것들, 바늘 종류와 사용법, 게이지, 실 라벨, 작품 기록, 재고 정리, 도안 보관, 블로킹, 바늘 고르기 등 뜨개를 이어 가기 위한 공개 가이드입니다.",
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
          있는 글입니다. 푸르시오 같은 뜨개 말, 뜨개로 만들 수 있는 것들, 바늘
          종류와 사용법, 게이지, 실 라벨, 작품 일지, 재고 정리, 도안 보관,
          블로킹, 바늘 고르기까지 기록과 준비에 필요한 글을 모았습니다. 도안
          판매나 후원 글은 없습니다.
        </p>
      </header>
      <GuideList />
    </div>
  );
};

export default GuidesPage;
