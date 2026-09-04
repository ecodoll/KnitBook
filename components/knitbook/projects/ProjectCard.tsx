"use client";

import Link from "next/link";
import type { Project, ProjectStatus } from "@/components/knitbook/types";
import ProjectProgress from "@/components/knitbook/projects/ProjectProgress";
import ProjectStatusBadge from "@/components/knitbook/projects/ProjectStatusBadge";
import ProjectStatusSelect from "@/components/knitbook/projects/ProjectStatusSelect";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronRight, Layers, Plus, Scissors } from "lucide-react";

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

/**
 * 작품 사진 자리(있으면 사진, 없으면 아이콘)를 렌더한다.
 */
const ProjectCover = ({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary",
        className
      )}
    >
      {project.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- 스토리지 서명 URL 대응
        <img
          src={project.coverImageUrl}
          alt={`${project.title} 사진`}
          className="size-full object-cover"
        />
      ) : (
        <Layers className="size-7 text-muted-foreground" aria-hidden />
      )}
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

  return (
    <Card size="sm" className={cn("gap-0 pt-0", className)}>
      <ProjectProgress
        variant="edge"
        percent={project.progressPercent}
        className="shrink-0"
      />

      {isDetail ? (
        <div className="flex items-start gap-3 px-(--card-spacing) pt-3">
          <ProjectCover
            project={project}
            className="size-28 sm:size-32"
          />
          <div className="min-w-0 flex-1 space-y-2">
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
            {project.notes ? (
              <p className="line-clamp-4 whitespace-pre-wrap text-sm">{project.notes}</p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 px-(--card-spacing) pt-3">
          <Link href={`/projects/${project.id}`} className="shrink-0">
            <ProjectCover project={project} className="size-20" />
          </Link>
          <Link
            href={`/projects/${project.id}`}
            className="min-w-0 flex-1 space-y-1"
          >
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
            {project.lastNote ? (
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {project.lastNote}
              </p>
            ) : null}
          </Link>
          <div className="flex h-20 shrink-0 flex-col items-end gap-1.5">
            <ProjectStatusBadge status={project.status} />
            {onQuickLog ? (
              <button
                type="button"
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "h-auto min-h-0 w-auto min-w-0 flex-1 aspect-square rounded-lg p-0"
                )}
                aria-label={`${project.title} 작업 기록`}
                onClick={() => onQuickLog(project.id)}
              >
                <Plus className="size-5" />
              </button>
            ) : null}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProjectCard;
