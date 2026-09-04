import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ProjectProgressProps = {
  percent: number;
  currentRow?: number;
  totalRows?: number;
  className?: string;
  showLabel?: boolean;
  /** edge는 카드 상단 테두리형 게이지만 표시한다. */
  variant?: "default" | "edge";
};

/**
 * 퍼센트·단수 기준 작품 진행률을 표시한다.
 */
const ProjectProgress = ({
  percent,
  currentRow,
  totalRows,
  className,
  showLabel = true,
  variant = "default",
}: ProjectProgressProps) => {
  const clamped = Math.min(100, Math.max(0, percent));

  if (variant === "edge") {
    return (
      <div
        role="progressbar"
        aria-label={`진행률 ${clamped}%`}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn("h-1 w-full bg-muted", className)}
      >
        <div
          className="h-full bg-primary transition-[width]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <Progress value={clamped}>
        {showLabel ? <ProgressLabel>진행률</ProgressLabel> : null}
        <ProgressValue>
          {(formatted) => formatted ?? `${clamped}%`}
        </ProgressValue>
      </Progress>
      {typeof currentRow === "number" ? (
        <p className="text-xs text-muted-foreground tabular-nums">
          {typeof totalRows === "number"
            ? `${currentRow}단 / ${totalRows}단`
            : `현재 ${currentRow}단`}
        </p>
      ) : null}
    </div>
  );
};

export default ProjectProgress;
