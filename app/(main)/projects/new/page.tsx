import type { Metadata } from "next";
import { redirect } from "next/navigation";
import NewProjectScreen from "@/app/(main)/projects/new/NewProjectScreen";
import { getPatternsPageData } from "@/lib/knitbook/pattern-data";
import { getYarnsPageData } from "@/lib/knitbook/yarn-data";

export const metadata: Metadata = {
  title: "새 작품 | KnitBook",
  description: "도안과 실을 연결해 새 작품을 시작하는 KnitBook 페이지입니다.",
};

type NewProjectPageProps = {
  searchParams: Promise<{ patternId?: string; title?: string }>;
};

/**
 * 작품 생성 페이지이다.
 */
const NewProjectPage = async ({ searchParams }: NewProjectPageProps) => {
  const params = await searchParams;

  let patternsData;
  let yarnsData;
  try {
    [patternsData, yarnsData] = await Promise.all([
      getPatternsPageData(),
      getYarnsPageData(),
    ]);
  } catch {
    redirect("/login");
  }

  if (!patternsData || !yarnsData) {
    redirect("/login");
  }

  return (
    <NewProjectScreen
      patterns={patternsData.patterns}
      yarns={yarnsData.yarns}
      defaultTitle={params.title}
      defaultPatternId={params.patternId}
    />
  );
};

export default NewProjectPage;
