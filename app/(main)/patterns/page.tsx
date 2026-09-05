import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import PatternsScreen from "@/app/(main)/patterns/PatternsScreen";
import PatternsPageFallback from "@/components/knitbook/patterns/PatternsPageFallback";
import { getPatternsPageData } from "@/lib/knitbook/pattern-data";

export const metadata: Metadata = {
  title: "도안 | KnitBook",
  description: "PDF 도안을 업로드하고 목록에서 관리하는 KnitBook 도안 페이지입니다.",
};

/**
 * 도안 목록 본문을 불러와 렌더한다.
 */
const PatternsListLoader = async () => {
  let data;
  try {
    data = await getPatternsPageData();
  } catch {
    redirect("/login");
  }

  if (!data) {
    redirect("/login");
  }

  return <PatternsScreen initialPatterns={data.patterns} />;
};

/**
 * 도안 목록 페이지이다.
 * 헤더·하단 내비는 레이아웃에서 즉시 유지되고, 목록만 스트리밍한다.
 */
const PatternsPage = () => {
  return (
    <Suspense fallback={<PatternsPageFallback />}>
      <PatternsListLoader />
    </Suspense>
  );
};

export default PatternsPage;
