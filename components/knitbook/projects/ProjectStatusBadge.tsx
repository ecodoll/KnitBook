import type { ProjectStatus } from "@/components/knitbook/types";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  planned: "계획",
  in_progress: "진행 중",
  paused: "일시정지",
  completed: "완료",
};

type ProjectStatusBadgeProps = {
  status: ProjectStatus;
};

/**
 * 작품 상태를 한글로 배지 표시한다.
 */
const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  const variant =
    status === "completed"
      ? "default"
      : status === "paused"
        ? "outline"
        : status === "planned"
          ? "secondary"
          : "default";

  return (
    <Badge
      variant={variant}
      className={
        status === "in_progress"
          ? "bg-primary text-primary-foreground"
          : status === "completed"
            ? "bg-brand-success text-primary-foreground"
            : undefined
      }
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
};

export default ProjectStatusBadge;
