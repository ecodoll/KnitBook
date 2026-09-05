import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import NewProjectScreen from "@/app/(main)/projects/new/NewProjectScreen";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import { getPatternsPageData } from "@/lib/knitbook/pattern-data";
import { getYarnsPageData } from "@/lib/knitbook/yarn-data";

export const metadata: Metadata = {
  title: "새 작품 | KnitBook",
  description: "도안과 실을 연결해 새 작품을 시작하는 KnitBook 페이지입니다.",
};

type NewProjectPageProps = {
  searchParams: Promise<{ patternId?: string; title?: string; yarnId?: string }>;
};

/**
 * 작품 생성 폼에 필요한 도안·실 목록을 불러온다.
 */
const NewProjectLoader = async ({
  title,
  patternId,
  yarnId,
}: {
  title?: string;
  patternId?: string;
  yarnId?: string;
}) => {
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
      defaultTitle={title}
      defaultPatternId={patternId}
      defaultYarnId={yarnId}
    />
  );
};

/**
 * 작품 생성 페이지이다.
 */
const NewProjectPage = async ({ searchParams }: NewProjectPageProps) => {
  const params = await searchParams;

  return (
    <Suspense fallback={<LoadingState variant="detail" />}>
      <NewProjectLoader
        title={params.title}
        patternId={params.patternId}
        yarnId={params.yarnId}
      />
    </Suspense>
  );
};

export default NewProjectPage;
