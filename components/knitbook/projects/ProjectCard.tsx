"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Project, ProjectStatus } from "@/components/knitbook/types";
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
 * 연결된 도안·실을 짧은 링크로 보여 준다.
 */
const ProjectLinkedItems = ({ project }: { project: Project }) => {
  const yarns = project.yarns ?? [];

  return (
    <dl className="space-y-1.5 rounded-lg bg-secondary/50 px-2.5 py-2">
      <div className="flex items-center gap-2">
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
            <span className="text-sm text-muted-foreground">없음</span>
          )}
        </dd>
      </div>
      <div className="flex items-start gap-2">
        <dt className="flex shrink-0 items-center gap-1 pt-0.5 text-xs text-muted-foreground">
          <Scissors className="size-3.5" aria-hidden />
          실
        </dt>
        <dd className="min-w-0 flex-1">
          {yarns.length === 0 ? (
            <span className="text-sm text-muted-foreground">없음</span>
          ) : (
            <ul className="space-y-1">
              {yarns.map((yarn) => (
                <li key={yarn.id}>
                  <Link
                    href={`/yarns/${yarn.yarnId}`}
                    className="flex items-center gap-1 text-sm hover:underline"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {[yarn.brand, yarn.productName, yarn.colorName]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    <ChevronRight
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
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
 * 사진은 우측 실 항목 높이에 맞추고, 메모는 사진 바로 아래 왼쪽에 둔다.
 */
const ProjectMediaLayout = ({
  cover,
  children,
  memo,
  memoClassName,
}: ProjectMediaLayoutProps) => {
  return (
    <div className="px-(--card-spacing) pt-3">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-stretch gap-3">
        {cover}
        <div className="flex min-h-0 min-w-0 flex-col gap-2">{children}</div>
      </div>
      {memo ? (
        <p
          className={cn(
            "mt-2 text-left whitespace-pre-wrap",
            memoClassName
          )}
        >
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
              className="h-full min-h-28 w-28 self-stretch sm:min-h-32 sm:w-32"
            />
          }
        >
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{project.title}</CardTitle>
            {onStatusChange ? (
              <ProjectStatusSelect
                status={project.status}
                disabled={isUpdating}
                onStatusChange={onStatusChange}
              />
            ) : null}
          </div>
          {rowSummary ? (
            <p className="text-xs text-muted-foreground tabular-nums">{rowSummary}</p>
          ) : null}
          {gaugeSummary ? (
            <p className="text-xs text-muted-foreground">{gaugeSummary}</p>
          ) : null}
          <ProjectLinkedItems project={project} />
        </ProjectMediaLayout>
      ) : (
        <ProjectMediaLayout
          memo={memo}
          memoClassName="line-clamp-3 text-sm text-muted-foreground"
          cover={
            <Link
              href={`/projects/${project.id}`}
              className="block h-full min-h-20 w-20 self-stretch"
            >
              <ProjectCover project={project} className="size-full" />
            </Link>
          }
        >
          <div className="flex items-start gap-2">
            <Link href={`/projects/${project.id}`} className="min-w-0 flex-1 space-y-1">
              <CardTitle className="line-clamp-2 hover:underline">
                {project.title}
              </CardTitle>
              {rowSummary ? (
                <p className="text-xs text-muted-foreground tabular-nums">{rowSummary}</p>
              ) : null}
              {lastWorkedLabel ? (
                <p className="text-xs text-muted-foreground">
                  마지막 작업 {lastWorkedLabel}
                </p>
              ) : null}
            </Link>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <ProjectStatusBadge status={project.status} />
              {onQuickLog ? (
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "secondary", size: "icon-sm" }))}
                  aria-label={`${project.title} 작업 기록`}
                  onClick={() => onQuickLog(project.id)}
                >
                  <Plus className="size-5" />
                </button>
              ) : null}
            </div>
          </div>
          <ProjectLinkedItems project={project} />
        </ProjectMediaLayout>
      )}
    </Card>
  );
};

export default ProjectCard;
