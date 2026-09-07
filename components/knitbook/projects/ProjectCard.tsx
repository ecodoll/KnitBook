"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Project, ProjectStatus, ProjectYarnLink } from "@/components/knitbook/types";
import ProjectProgress from "@/components/knitbook/projects/ProjectProgress";
import ProjectStatusBadge from "@/components/knitbook/projects/ProjectStatusBadge";
import ProjectStatusSelect from "@/components/knitbook/projects/ProjectStatusSelect";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ProjectCover from "@/components/knitbook/projects/ProjectCover";
import { BookOpen, ChevronRight, Plus, Scissors } from "lucide-react";

type ProjectCardProps = {
  project: Project;
  onQuickLog?: (projectId: string) => void;
  /** 있으면 상세 관리 카드로 렌더하고 상태를 바로 바꿀 수 있다. */
  onStatusChange?: (status: ProjectStatus) => void;
  isUpdating?: boolean;
  className?: string;
};

/**
 * 단수 요약 문구를 만든다.
 */
const formatRowSummary = (project: Project) => {
  if (typeof project.currentRow !== "number") {
    return null;
  }
  if (typeof project.totalRows === "number") {
    return `${project.currentRow}단 / ${project.totalRows}단`;
  }
  return `현재 ${project.currentRow}단`;
};

/**
 * 게이지 요약 문구를 만든다.
 */
const formatGaugeSummary = (project: Project) => {
  const parts = [
    typeof project.gaugeStitches === "number" ? `${project.gaugeStitches}코` : null,
    typeof project.gaugeRows === "number" ? `${project.gaugeRows}단` : null,
  ].filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  return `게이지 10cm ${parts.join(" × ")}`;
};

/**
 * 실 이름을 한 줄 문구로 만든다. 여러 개면 첫 실과 나머지 개수만 붙인다.
 */
const formatYarnLine = (yarns: ProjectYarnLink[]) => {
  if (yarns.length === 0) {
    return "없음";
  }

  const first = [yarns[0].brand, yarns[0].productName, yarns[0].colorName]
    .filter(Boolean)
    .join(" · ");
  if (yarns.length === 1) {
    return first;
  }

  return `${first} 외 ${yarns.length - 1}개`;
};

/**
 * 연결된 도안·실을 항상 같은 높이의 두 줄로 보여 준다.
 */
const ProjectLinkedItems = ({ project }: { project: Project }) => {
  const yarns = project.yarns ?? [];
  const yarnLine = formatYarnLine(yarns);
  const firstYarn = yarns[0];

  return (
    <dl className="space-y-1 rounded-lg bg-secondary/50 px-2.5 py-2">
      <div className="flex h-5 items-center gap-2">
        <dt className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <BookOpen className="size-3.5" aria-hidden />
          도안
        </dt>
        <dd className="min-w-0 flex-1">
          {project.patternId ? (
            <Link
              href={`/patterns/${project.patternId}`}
              className="flex items-center gap-1 text-sm hover:underline"
            >
              <span className="min-w-0 flex-1 truncate">
                {project.patternTitle ?? "도안 보기"}
              </span>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          ) : (
            <span className="block truncate text-sm text-muted-foreground">없음</span>
          )}
        </dd>
      </div>
      <div className="flex h-5 items-center gap-2">
        <dt className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Scissors className="size-3.5" aria-hidden />
          실
        </dt>
        <dd className="min-w-0 flex-1">
          {firstYarn ? (
            <Link
              href={`/yarns/${firstYarn.yarnId}`}
              className="flex items-center gap-1 text-sm hover:underline"
            >
              <span className="min-w-0 flex-1 truncate">{yarnLine}</span>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          ) : (
            <span className="block truncate text-sm text-muted-foreground">{yarnLine}</span>
          )}
        </dd>
      </div>
    </dl>
  );
};

type ProjectMediaLayoutProps = {
  cover: ReactNode;
  children: ReactNode;
  memo?: string | null;
  memoClassName?: string;
};

/**
 * 정사각형 사진 옆에 제목·도안·실을 두고, 메모는 사진 바로 아래 왼쪽에 둔다.
 */
const ProjectMediaLayout = ({
  cover,
  children,
  memo,
  memoClassName,
}: ProjectMediaLayoutProps) => {
  return (
    <div className="px-(--card-spacing) pt-3">
      <div className="flex items-start gap-3">
        {cover}
        <div className="min-w-0 flex-1 space-y-1">{children}</div>
      </div>
      {memo ? (
        <p className={cn("mt-2 text-left whitespace-pre-wrap", memoClassName)}>
          {memo}
        </p>
      ) : null}
    </div>
  );
};

/**
 * 작품 썸네일·진행률·연결 정보를 하나의 카드로 표시한다.
 */
const ProjectCard = ({
  project,
  onQuickLog,
  onStatusChange,
  isUpdating = false,
  className,
}: ProjectCardProps) => {
  const isDetail = Boolean(onStatusChange);
  const lastWorkedLabel = project.lastWorkedAt
    ? new Date(project.lastWorkedAt).toLocaleDateString("ko-KR", {
        month: "numeric",
        day: "numeric",
      })
    : null;
  const rowSummary = formatRowSummary(project);
  const gaugeSummary = formatGaugeSummary(project);
  const memo = project.notes || (!isDetail ? project.lastNote : undefined);
  const metaLine = [rowSummary, lastWorkedLabel ? `마지막 작업 ${lastWorkedLabel}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card size="sm" className={cn("gap-0 pt-0", className)}>
      <ProjectProgress
        variant="edge"
        percent={project.progressPercent}
        className="shrink-0"
      />

      {isDetail ? (
        <ProjectMediaLayout
          memo={memo}
          memoClassName="line-clamp-4 text-sm"
          cover={
            <ProjectCover
              project={project}
              className="size-28 shrink-0 sm:size-32"
            />
          }
        >
          <div className="flex h-6 items-center justify-between gap-2">
            <CardTitle className="min-w-0 truncate text-base leading-none">
              {project.title}
            </CardTitle>
            {onStatusChange ? (
              <ProjectStatusSelect
                status={project.status}
                disabled={isUpdating}
                onStatusChange={onStatusChange}
              />
            ) : null}
          </div>
          <p className="h-4 truncate text-xs text-muted-foreground tabular-nums">
            {[rowSummary, gaugeSummary].filter(Boolean).join(" · ") || "\u00a0"}
          </p>
          <ProjectLinkedItems project={project} />
        </ProjectMediaLayout>
      ) : (
        <ProjectMediaLayout
          memo={memo}
          memoClassName="line-clamp-3 text-sm text-muted-foreground"
          cover={
            <Link href={`/projects/${project.id}`} className="shrink-0">
              <ProjectCover project={project} className="size-20" />
            </Link>
          }
        >
          <div className="flex min-h-7 items-center gap-2">
            <Link href={`/projects/${project.id}`} className="min-w-0 flex-1">
              <CardTitle className="truncate text-base font-semibold leading-snug group-data-[size=sm]/card:text-base hover:underline">
                {project.title}
              </CardTitle>
            </Link>
            <div className="flex shrink-0 items-center gap-1.5">
              <ProjectStatusBadge status={project.status} />
              {onQuickLog ? (
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "secondary", size: "icon-xs" }))}
                  aria-label={`${project.title} 작업 기록`}
                  onClick={() => onQuickLog(project.id)}
                >
                  <Plus className="size-4" />
                </button>
              ) : null}
            </div>
          </div>
          <p className="h-4 truncate text-xs text-muted-foreground tabular-nums">
            {metaLine || "\u00a0"}
          </p>
          <ProjectLinkedItems project={project} />
        </ProjectMediaLayout>
      )}
    </Card>
  );
};

export default ProjectCard;
