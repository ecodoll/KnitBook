import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ProjectProgressProps = {
  percent: number;
  currentRow?: number;
  totalRows?: number;
  className?: string;
  showLabel?: boolean;
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
}: ProjectProgressProps) => {
  const clamped = Math.min(100, Math.max(0, percent));

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
