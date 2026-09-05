import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import ProjectsScreen from "@/app/(main)/projects/ProjectsScreen";
import ProjectsPageFallback from "@/components/knitbook/projects/ProjectsPageFallback";
import { getProjectsPageData } from "@/lib/knitbook/project-data";

export const metadata: Metadata = {
  title: "작품 | KnitBook",
  description: "진행 중인 작품을 기록하고 도안·실과 연결하는 KnitBook 작품 페이지입니다.",
};

/**
 * 작품 목록 본문을 불러와 렌더한다.
 */
const ProjectsListLoader = async () => {
  let data;
  try {
    data = await getProjectsPageData();
  } catch (error) {
    if (error instanceof Error && error.message.includes("로그인")) {
      redirect("/login");
    }
    throw error;
  }

  if (!data) {
    redirect("/login");
  }

  return <ProjectsScreen initialProjects={data.projects} />;
};

/**
 * 작품 목록 페이지이다.
 */
const ProjectsPage = () => {
  return (
    <Suspense fallback={<ProjectsPageFallback />}>
      <ProjectsListLoader />
    </Suspense>
  );
};

export default ProjectsPage;
