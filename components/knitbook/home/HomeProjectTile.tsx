import Link from "next/link";
import type { Project } from "@/components/knitbook/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Layers, Plus } from "lucide-react";

type HomeProjectTileProps = {
  project: Project;
  onQuickLog?: (projectId: string) => void;
  className?: string;
};

/**
 * 홈용 작품 타일(사진·막대 게이지·제목)을 표시한다.
 */
const HomeProjectTile = ({
  project,
  onQuickLog,
  className,
}: HomeProjectTileProps) => {
  const clamped = Math.min(100, Math.max(0, project.progressPercent));

  return (
    <div className={cn("relative", className)}>
      <Link
        href={`/projects/${project.id}`}
        className="group block outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-lg"
      >
        <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary ring-1 ring-foreground/10 transition-shadow group-hover:shadow-sm">
          {project.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- 외부 스토리지 URL 대응
            <img
              src={project.coverImageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center">
              <Layers className="size-5 text-muted-foreground" aria-hidden />
            </span>
          )}
        </div>
        <Progress
          value={clamped}
          className="mt-1.5 gap-0"
          aria-label={`${project.title} 진행률 ${clamped}%`}
        />
        <p className="mt-1 truncate text-center text-xs font-medium text-foreground">
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
