"use client";

import type { Project } from "@/components/knitbook/types";
import StorageImage from "@/components/knitbook/shared/StorageImage";
import { resolveProjectImageUrl } from "@/lib/knitbook/project-client";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

type ProjectCoverProps = {
  project: Pick<Project, "title" | "coverImageUrl" | "coverImageStoragePath">;
  className?: string;
  /** 사진이 없을 때 쓰는 아이콘 크기 클래스 */
  iconClassName?: string;
};

/**
 * 작품 대표 사진을 보여 주고, Storage 경로는 클라이언트에서 서명한다.
 */
const ProjectCover = ({
  project,
  className,
  iconClassName = "size-7",
}: ProjectCoverProps) => {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary",
        className
      )}
    >
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
    </div>
  );
};

export default ProjectCover;
