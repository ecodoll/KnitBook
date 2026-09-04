import type { ProjectStatus } from "@/components/knitbook/types";

/** 작품 상태 한글 라벨 */
export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  planned: "계획",
  in_progress: "진행 중",
  paused: "일시정지",
  completed: "완료",
};

/** 상태 선택에 쓰는 옵션 목록 */
export const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = (
  Object.entries(PROJECT_STATUS_LABEL) as [ProjectStatus, string][]
).map(([value, label]) => ({ value, label }));

/**
 * 상태 배지·드롭다운 트리거에 쓰는 색상 클래스를 반환한다.
 */
export const getProjectStatusToneClass = (status: ProjectStatus) => {
  if (status === "in_progress") {
    return "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground";
  }
  if (status === "completed") {
    return "bg-brand-success text-primary-foreground hover:bg-brand-success/90 hover:text-primary-foreground";
  }
  if (status === "planned") {
    return "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground";
  }
  return "border border-border bg-card text-foreground hover:bg-muted hover:text-foreground";
};
