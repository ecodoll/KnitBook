"use client";

import Link from "next/link";
import type { Project } from "@/components/knitbook/types";
import ProjectCover from "@/components/knitbook/projects/ProjectCover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

type HomeProjectTileProps = {
  project: Project;
  onQuickLog?: (projectId: string) => void;
  className?: string;
};

/**
 * 홈용 작품 타일(사진·제목)을 표시한다.
 */
const HomeProjectTile = ({
  project,
  onQuickLog,
  className,
}: HomeProjectTileProps) => {
  return (
    <div className={cn("relative", className)}>
      <Link
        href={`/projects/${project.id}`}
        className="group block outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-lg"
      >
        <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary ring-1 ring-foreground/10 transition-shadow group-hover:shadow-sm">
          <ProjectCover
            project={project}
            className="size-full rounded-none"
            iconClassName="size-5"
          />
        </div>
        <p className="mt-1.5 truncate text-center text-xs font-medium text-foreground">
          {project.title}
        </p>
      </Link>
      {onQuickLog ? (
        <Button
          type="button"
          variant="secondary"
          size="icon-xs"
          className="absolute top-1.5 right-1.5 rounded-full bg-card/90 shadow-xs"
          aria-label={`${project.title} 작업 기록`}
          onClick={() => onQuickLog(project.id)}
        >
          <Plus />
        </Button>
      ) : null}
    </div>
  );
};

export default HomeProjectTile;
