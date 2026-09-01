import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import YarnsScreen from "@/app/(main)/yarns/YarnsScreen";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { getYarnsPageData } from "@/lib/knitbook/yarn-data";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "실 | KnitBook",
  description: "보유한 실 재고를 등록하고 남은 양을 관리하는 KnitBook 실 페이지입니다.",
};

/**
 * 실 목록 로딩 중 헤더 골격과 카드 스켈레톤을 보여준다.
 */
const YarnsPageFallback = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">실</h1>
          <p className="text-sm text-muted-foreground">
            보유한 실의 종류와 남은 양을 한곳에서 관리해요.
          </p>
        </div>
        <Button size="sm" disabled>
          <Plus data-icon="inline-start" />
          등록
        </Button>
      </div>
      <LoadingState rows={4} />
    </div>
  );
};

/**
 * 실 목록 본문을 불러와 렌더한다.
 */
const YarnsListLoader = async () => {
  let data;
  try {
    data = await getYarnsPageData();
  } catch {
    redirect("/login");
  }

  if (!data) {
    redirect("/login");
  }

  return <YarnsScreen initialYarns={data.yarns} />;
};

/**
 * 실 재고 목록 페이지이다.
 */
const YarnsPage = () => {
  return (
    <Suspense fallback={<YarnsPageFallback />}>
      <YarnsListLoader />
    </Suspense>
  );
};

export default YarnsPage;
