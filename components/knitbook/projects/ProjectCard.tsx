"use client";

import Link from "next/link";
import type { Project, ProjectStatus } from "@/components/knitbook/types";
import ProjectProgress from "@/components/knitbook/projects/ProjectProgress";
import ProjectStatusBadge from "@/components/knitbook/projects/ProjectStatusBadge";
import ProjectStatusSelect from "@/components/knitbook/projects/ProjectStatusSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    <dl className="space-y-2 rounded-lg bg-secondary/50 px-3 py-2.5">
      <div className="flex items-center gap-3">
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
      <div className="flex items-start gap-3">
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
        <>
          {project.coverImageUrl ? (
            <div className="mt-3 overflow-hidden px-(--card-spacing)">
              {/* eslint-disable-next-line @next/next/no-img-element -- 스토리지 서명 URL 대응 */}
              <img
                src={project.coverImageUrl}
                alt={`${project.title} 사진`}
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            </div>
          ) : null}
          <CardHeader className="pt-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg">{project.title}</CardTitle>
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
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            <ProjectLinkedItems project={project} />
            {project.notes ? (
              <p className="whitespace-pre-wrap text-sm">{project.notes}</p>
            ) : null}
          </CardContent>
        </>
      ) : (
        <>
          <Link href={`/projects/${project.id}`} className="block">
            <CardHeader className="flex-row items-start gap-3 pt-3">
              <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                {project.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- 외부 스토리지 URL 대응
                  <img
                    src={project.coverImageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <Layers className="size-6 text-muted-foreground" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 hover:underline">
                    {project.title}
                  </CardTitle>
                  <ProjectStatusBadge status={project.status} />
                </div>
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
              </div>
            </CardHeader>
          </Link>
          {onQuickLog ? (
            <CardFooter className="pt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => onQuickLog(project.id)}
              >
                <Plus data-icon="inline-start" />
                작업 기록
              </Button>
            </CardFooter>
          ) : null}
        </>
      )}
    </Card>
  );
};

export default ProjectCard;
