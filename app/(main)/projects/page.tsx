import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import ProjectsScreen from "@/app/(main)/projects/ProjectsScreen";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { getProjectsPageData } from "@/lib/knitbook/project-data";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "작품 | KnitBook",
  description: "진행 중인 작품을 기록하고 도안·실과 연결하는 KnitBook 작품 페이지입니다.",
};

/**
 * 작품 목록 로딩 중 헤더 골격과 카드 스켈레톤을 보여준다.
 */
const ProjectsPageFallback = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">작품</h1>
          <p className="text-sm text-muted-foreground">
            진행 중인 작품을 기록하고 도안·실과 연결해요.
          </p>
        </div>
        <Button size="sm" disabled>
          <Plus data-icon="inline-start" />
          새 작품
        </Button>
      </div>
      <LoadingState rows={3} />
    </div>
  );
};

/**
 * 작품 목록 본문을 불러와 렌더한다.
 */
const ProjectsListLoader = async () => {
  let data;
  try {
    data = await getProjectsPageData();
  } catch {
    redirect("/login");
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
