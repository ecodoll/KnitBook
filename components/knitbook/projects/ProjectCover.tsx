"use client";

import type { Project } from "@/components/knitbook/types";
import PatternCover from "@/components/knitbook/patterns/PatternCover";
import StorageImage from "@/components/knitbook/shared/StorageImage";
import { resolveProjectImageUrl } from "@/lib/knitbook/project-client";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

type ProjectCoverProps = {
  project: Pick<
    Project,
    | "title"
    | "coverImageUrl"
    | "coverImageStoragePath"
    | "patternId"
    | "patternTitle"
    | "patternCoverImageUrl"
    | "patternCoverStoragePath"
    | "patternPdfStoragePath"
  >;
  className?: string;
  /** 사진이 없을 때 쓰는 아이콘 크기 클래스 */
  iconClassName?: string;
};

/**
 * 최근 작업 사진이 있으면 그 사진을, 없으면 연결 도안 썸네일을 보여 준다.
 */
const ProjectCover = ({
  project,
  className,
  iconClassName = "size-7",
}: ProjectCoverProps) => {
  const hasLogPhoto = Boolean(project.coverImageUrl || project.coverImageStoragePath);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary",
        className
      )}
    >
      {hasLogPhoto ? (
        <StorageImage
          src={project.coverImageUrl}
          storagePath={project.coverImageStoragePath}
          resolveUrl={resolveProjectImageUrl}
          alt=""
          className="size-full object-cover"
          fallback={
            <Layers className={cn("text-muted-foreground", iconClassName)} aria-hidden />
          }
        />
      ) : project.patternId ? (
        <PatternCover
          patternId={project.patternId}
          title={project.patternTitle ?? project.title}
          coverImageUrl={project.patternCoverImageUrl}
          coverStoragePath={project.patternCoverStoragePath}
          pdfStoragePath={project.patternPdfStoragePath}
          compact
        />
      ) : (
        <Layers className={cn("text-muted-foreground", iconClassName)} aria-hidden />
      )}
    </div>
  );
};

export default ProjectCover;
