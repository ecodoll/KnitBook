import type { ProjectStatus } from "@/components/knitbook/types";
import {
  PROJECT_STATUS_LABEL,
  getProjectStatusToneClass,
} from "@/components/knitbook/projects/status";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProjectStatusBadgeProps = {
  status: ProjectStatus;
};

/**
 * 작품 상태를 한글로 배지 표시한다.
 */
const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  const variant =
    status === "paused"
      ? "outline"
      : status === "planned"
        ? "secondary"
        : "default";

  return (
    <Badge
      variant={variant}
      className={cn(
        status === "paused" ? undefined : "border-transparent",
        getProjectStatusToneClass(status)
      )}
    >
      {PROJECT_STATUS_LABEL[status]}
    </Badge>
  );
};

export default ProjectStatusBadge;
