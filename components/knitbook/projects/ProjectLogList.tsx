"use client";

import type { WorkLog } from "@/components/knitbook/types";
import EmptyState from "@/components/knitbook/shared/EmptyState";
import StorageImage from "@/components/knitbook/shared/StorageImage";
import { formatWorkDurationLabel } from "@/lib/knitbook/projects/constants";
import { resolveProjectImageUrl } from "@/lib/knitbook/project-client";

type ProjectLogListProps = {
  logs: WorkLog[];
};

/**
 * 작품 작업 기록을 최신순으로 보여준다.
 */
const ProjectLogList = ({ logs }: ProjectLogListProps) => {
  if (logs.length === 0) {
    return (
      <EmptyState
        title="아직 기록이 없어요"
        description="뜨개를 멈추면 단수와 메모를 남겨 보세요."
      />
    );
  }

  return (
    <ol className="space-y-3">
      {logs.map((log) => {
        const dateLabel = new Date(log.date).toLocaleDateString("ko-KR", {
          month: "numeric",
          day: "numeric",
        });

        return (
          <li
            key={log.id}
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          >
            <p className="font-medium">{dateLabel}</p>
            <p className="mt-0.5 text-muted-foreground">
              {[
                typeof log.currentRow === "number" ? `${log.currentRow}단` : null,
                typeof log.progressPercent === "number"
                  ? `${log.progressPercent}%`
                  : null,
                typeof log.durationMinutes === "number"
                  ? formatWorkDurationLabel(log.durationMinutes)
                  : null,
              ]
                .filter(Boolean)
                .join(" · ") || "진행 기록"}
            </p>
            {log.photoUrl || log.photoStoragePath ? (
              <div className="mt-2 overflow-hidden rounded-md bg-secondary">
                <StorageImage
                  src={log.photoUrl}
                  storagePath={log.photoStoragePath}
                  resolveUrl={resolveProjectImageUrl}
                  alt=""
                  className="aspect-square w-full object-cover"
                  fallback={null}
                />
              </div>
            ) : null}
            {log.memo ? (
              <p className="mt-1 whitespace-pre-wrap">{log.memo}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
};

export default ProjectLogList;
