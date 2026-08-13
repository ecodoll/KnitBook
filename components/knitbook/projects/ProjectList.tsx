"use client";

import type { Project, ProjectStatus } from "@/components/knitbook/types";
import ProjectCard from "@/components/knitbook/projects/ProjectCard";
import EmptyState from "@/components/knitbook/shared/EmptyState";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type ProjectListProps = {
  projects: Project[];
  activeStatus: ProjectStatus | "all";
  onStatusChange: (status: ProjectStatus | "all") => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onQuickLog?: (projectId: string) => void;
  className?: string;
};

const STATUS_TABS: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "in_progress", label: "진행 중" },
  { value: "paused", label: "일시정지" },
  { value: "completed", label: "완료" },
  { value: "planned", label: "계획" },
];

/**
 * 상태 탭과 작품 목록을 표시한다.
 */
const ProjectList = ({
  projects,
  activeStatus,
  onStatusChange,
  isLoading,
  errorMessage,
  onRetry,
  onQuickLog,
  className,
}: ProjectListProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <Tabs
        value={activeStatus}
        onValueChange={(value) => onStatusChange(value as ProjectStatus | "all")}
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeStatus} className="mt-4">
          {isLoading ? <LoadingState rows={3} /> : null}

          {!isLoading && errorMessage ? (
            <ErrorState
              title="작품을 불러오지 못했어요"
              message={errorMessage}
              onRetry={onRetry}
            />
          ) : null}

          {!isLoading && !errorMessage && projects.length === 0 ? (
            <EmptyState
              title="작품이 없어요"
              description="도안과 실을 연결해 새 작품을 시작해 보세요."
              actionLabel="작품 만들기"
              actionHref="/projects/new"
            />
          ) : null}

          {!isLoading && !errorMessage && projects.length > 0 ? (
            <ul className="space-y-3">
              {projects.map((project) => (
                <li key={project.id}>
                  <ProjectCard project={project} onQuickLog={onQuickLog} />
                </li>
              ))}
            </ul>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectList;
