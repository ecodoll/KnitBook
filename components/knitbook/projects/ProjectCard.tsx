import Link from "next/link";
import type { Project } from "@/components/knitbook/types";
import ProjectProgress from "@/components/knitbook/projects/ProjectProgress";
import ProjectStatusBadge from "@/components/knitbook/projects/ProjectStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Layers, Plus } from "lucide-react";

type ProjectCardProps = {
  project: Project;
  onQuickLog?: (projectId: string) => void;
  className?: string;
};

/**
 * 작품 썸네일·진행률·작업 기록 진입을 카드로 표시한다.
 */
const ProjectCard = ({ project, onQuickLog, className }: ProjectCardProps) => {
  const lastWorkedLabel = project.lastWorkedAt
    ? new Date(project.lastWorkedAt).toLocaleDateString("ko-KR", {
        month: "numeric",
        day: "numeric",
      })
    : null;

  return (
    <Card size="sm" className={cn(className)}>
      <Link href={`/projects/${project.id}`} className="block">
        <CardHeader className="flex-row items-start gap-3">
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
            {lastWorkedLabel ? (
              <p className="text-xs text-muted-foreground">마지막 작업 {lastWorkedLabel}</p>
            ) : null}
            {project.lastNote ? (
              <p className="line-clamp-1 text-xs text-muted-foreground">{project.lastNote}</p>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <ProjectProgress
            percent={project.progressPercent}
            currentRow={project.currentRow}
            totalRows={project.totalRows}
          />
        </CardContent>
      </Link>
      {onQuickLog ? (
        <CardFooter>
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
    </Card>
  );
};

export default ProjectCard;
