import type { Metadata } from "next";
import GuideList from "@/components/site/GuideList";
import { withPublicCanonical } from "@/lib/knitbook/public-metadata";

export const metadata: Metadata = withPublicCanonical("/guides", {
  title: "뜨개 가이드",
  description:
    "재미있는 뜨개 용어, 뜨개로 만들 수 있는 것들, 작품 관리, 바늘 종류와 사용법, 게이지, 실 라벨, 작품 기록, 재고 정리, 도안 보관, 블로킹, 바늘 고르기 등 뜨개를 이어 가기 위한 공개 가이드입니다.",
});

/**
 * 로그인 없이 읽을 수 있는 뜨개 가이드 목록이다.
 */
const GuidesPage = () => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          뜨개 가이드
        </h1>
      </header>
      <GuideList />
    </div>
  );
};

export default GuidesPage;
