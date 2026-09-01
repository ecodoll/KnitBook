import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ProjectDetailScreen from "@/app/(main)/projects/[id]/ProjectDetailScreen";
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
 * 작품 상세 페이지이다.
 */
const ProjectDetailPage = async ({ params }: ProjectDetailPageProps) => {
  const { id } = await params;

  let detail;
  let patternsData;
  let yarnsData;
  try {
    [detail, patternsData, yarnsData] = await Promise.all([
      getProjectDetailPageData(id),
      getPatternsPageData(),
      getYarnsPageData(),
    ]);
  } catch {
    redirect("/login");
  }

  if (!detail || !patternsData || !yarnsData) {
    if (!detail) {
      notFound();
    }
    redirect("/login");
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

export default ProjectDetailPage;
