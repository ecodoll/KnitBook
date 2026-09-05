import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import YarnsScreen from "@/app/(main)/yarns/YarnsScreen";
import YarnsPageFallback from "@/components/knitbook/yarns/YarnsPageFallback";
import { getYarnsPageData } from "@/lib/knitbook/yarn-data";

export const metadata: Metadata = {
  title: "실 | KnitBook",
  description: "보유한 실 재고를 등록하고 남은 양을 관리하는 KnitBook 실 페이지입니다.",
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
