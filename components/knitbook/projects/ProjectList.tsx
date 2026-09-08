"use client";

import type { Project, ProjectStatus } from "@/components/knitbook/types";
import ProjectCard from "@/components/knitbook/projects/ProjectCard";
import EmptyState from "@/components/knitbook/shared/EmptyState";
import ListToolbar from "@/components/knitbook/shared/ListToolbar";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProjectListProps = {
  projects: Project[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeStatus: ProjectStatus | "all";
  onStatusChange: (status: ProjectStatus | "all") => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onQuickLog?: (projectId: string) => void;
  className?: string;
};

const STATUS_FILTERS: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "in_progress", label: "진행 중" },
  { value: "paused", label: "일시정지" },
  { value: "completed", label: "완료" },
  { value: "planned", label: "계획" },
];

type ProjectFilterBarProps = {
  activeStatus: ProjectStatus | "all";
  onStatusChange: (status: ProjectStatus | "all") => void;
};

/**
 * 작품 상태 필터 칩을 렌더링한다.
 */
const ProjectFilterBar = ({
  activeStatus,
  onStatusChange,
}: ProjectFilterBarProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="toolbar" aria-label="작품 필터">
      {STATUS_FILTERS.map((filter) => (
        <Button
          key={filter.value}
          type="button"
          size="sm"
          variant={activeStatus === filter.value ? "default" : "outline"}
          onClick={() => onStatusChange(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

/**
 * 검색·등록·상태 필터와 작품 목록을 표시한다.
 */
const ProjectList = ({
  projects,
  searchQuery,
  onSearchChange,
  activeStatus,
  onStatusChange,
  isLoading,
  errorMessage,
  onRetry,
  onQuickLog,
  className,
}: ProjectListProps) => {
  const isFiltered = Boolean(searchQuery) || activeStatus !== "all";

  return (
    <div className={cn("space-y-4", className)}>
      <ListToolbar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="작품 이름, 도안, 실 검색"
        searchLabel="작품 검색"
        searchId="project-search"
        actionHref="/projects/new"
        actionLabel="등록"
      >
        <ProjectFilterBar
          activeStatus={activeStatus}
          onStatusChange={onStatusChange}
        />
      </ListToolbar>

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
          description={
            isFiltered
              ? "조건에 맞는 작품이 없어요. 필터를 바꿔 보세요."
              : "도안과 실을 연결해 새 작품을 시작해 보세요."
          }
          actionLabel={isFiltered ? undefined : "작품 만들기"}
          actionHref={isFiltered ? undefined : "/projects/new"}
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
    </div>
  );
};

export default ProjectList;
