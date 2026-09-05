import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import ProjectDetailScreen from "@/app/(main)/projects/[id]/ProjectDetailScreen";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import { getPatternsPageData } from "@/lib/knitbook/pattern-data";
import { getProjectDetailPageData } from "@/lib/knitbook/project-data";
import { getYarnsPageData } from "@/lib/knitbook/yarn-data";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({
  params,
}: ProjectDetailPageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const data = await getProjectDetailPageData(id);
    if (!data) {
      return { title: "작품 | KnitBook" };
    }

    return {
      title: `${data.project.title} | KnitBook`,
      description: `${data.project.title} 작품 진행을 기록하는 KnitBook 페이지입니다.`,
    };
  } catch {
    return { title: "작품 | KnitBook" };
  }
};

/**
 * 작품 상세 본문을 불러와 렌더한다.
 */
const ProjectDetailLoader = async ({ id }: { id: string }) => {
  let detail;
  let patternsData;
  let yarnsData;
  try {
    [detail, patternsData, yarnsData] = await Promise.all([
      getProjectDetailPageData(id),
      getPatternsPageData(),
      getYarnsPageData(),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message.includes("로그인")) {
      redirect("/login");
    }
    throw error;
  }

  if (!patternsData || !yarnsData) {
    redirect("/login");
  }

  if (!detail) {
    notFound();
  }

  return (
    <ProjectDetailScreen
      key={detail.project.id}
      initialProject={detail.project}
      initialLogs={detail.logs}
      patterns={patternsData.patterns}
      yarns={yarnsData.yarns}
    />
  );
};

/**
 * 작품 상세 페이지이다.
 */
const ProjectDetailPage = async ({ params }: ProjectDetailPageProps) => {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingState variant="detail" />}>
      <ProjectDetailLoader id={id} />
    </Suspense>
  );
};

export default ProjectDetailPage;
