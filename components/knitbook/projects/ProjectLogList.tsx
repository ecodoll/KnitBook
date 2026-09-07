"use client";

import { useState } from "react";
import type { WorkLog } from "@/components/knitbook/types";
import type { QuickLogValues } from "@/components/knitbook/projects/QuickLogForm";
import QuickLogForm from "@/components/knitbook/projects/QuickLogForm";
import EmptyState from "@/components/knitbook/shared/EmptyState";
import StorageImage from "@/components/knitbook/shared/StorageImage";
import { resolveProjectImageUrl } from "@/lib/knitbook/project-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera } from "lucide-react";

type ProjectLogListProps = {
  logs: WorkLog[];
  projectTitle: string;
  isSaving?: boolean;
  isDeleting?: boolean;
  onUpdate: (logId: string, values: QuickLogValues) => Promise<void>;
  onDelete: (logId: string) => Promise<void>;
};

/**
 * 기록 날짜를 격자 카드에 짧게 보여 준다.
 */
const formatLogDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10);
  }
  return parsed.toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });
};

/**
 * 기록 카드를 고를 때 쓰는 접근성 이름을 만든다.
 */
const buildLogLabel = (log: WorkLog) => {
  const parts = [
    formatLogDate(log.date),
    typeof log.currentRow === "number" ? `${log.currentRow}단` : null,
    typeof log.progressPercent === "number" ? `${log.progressPercent}%` : null,
  ].filter(Boolean);
  return `${parts.join(" · ")} 기록 수정`;
};

type WorkLogTileProps = {
  log: WorkLog;
  onSelect: (log: WorkLog) => void;
};

/**
 * 인스타그램처럼 정사각형 한 칸으로 작업 기록을 보여 준다.
 */
const WorkLogTile = ({ log, onSelect }: WorkLogTileProps) => {
  const hasPhoto = Boolean(log.photoUrl || log.photoStoragePath);
  const dateLabel = formatLogDate(log.date);

  return (
    <li className="min-w-0">
      <button
        type="button"
        className="group relative block aspect-square w-full overflow-hidden bg-muted outline-none focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/60"
        onClick={() => onSelect(log)}
        aria-label={buildLogLabel(log)}
      >
        {hasPhoto ? (
          <StorageImage
            src={log.photoUrl}
            storagePath={log.photoStoragePath}
            resolveUrl={resolveProjectImageUrl}
            alt=""
            className="size-full object-cover transition-transform group-hover:scale-[1.03]"
            fallback={
              <span className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
                <Camera className="size-5" aria-hidden />
                <span className="text-[11px]">{dateLabel}</span>
              </span>
            }
          />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-1 px-1 text-center">
            <Camera className="size-5 text-muted-foreground" aria-hidden />
            <span className="text-[11px] font-medium leading-tight">{dateLabel}</span>
            {typeof log.currentRow === "number" ? (
              <span className="text-[11px] text-muted-foreground">{log.currentRow}단</span>
            ) : log.memo ? (
              <span className="line-clamp-2 text-[10px] text-muted-foreground">
                {log.memo}
              </span>
            ) : null}
          </span>
        )}
        {hasPhoto ? (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-1.5 py-1 text-left text-[10px] font-medium text-white">
            {dateLabel}
            {typeof log.currentRow === "number" ? ` · ${log.currentRow}단` : ""}
          </span>
        ) : null}
      </button>
    </li>
  );
};

/**
 * 작품 작업 기록을 3열 격자로 보여주고, 선택하면 수정·삭제한다.
 */
const ProjectLogList = ({
  logs,
  projectTitle,
  isSaving = false,
  isDeleting = false,
  onUpdate,
  onDelete,
}: ProjectLogListProps) => {
  const [selectedLog, setSelectedLog] = useState<WorkLog | null>(null);

  if (logs.length === 0) {
    return (
      <EmptyState
        title="아직 기록이 없어요"
        description="뜨개를 멈추면 단수와 메모를 남겨 보세요."
      />
    );
  }

  return (
    <>
      <ul className="-mx-4 grid grid-cols-3 gap-0.5">
        {logs.map((log) => (
          <WorkLogTile key={log.id} log={log} onSelect={setSelectedLog} />
        ))}
      </ul>

      <Dialog
        open={selectedLog !== null}
        onOpenChange={(open) => {
          if (!open && !isSaving && !isDeleting) {
            setSelectedLog(null);
          }
        }}
      >
        <DialogContent className="max-w-md gap-0 p-0 sm:max-w-md">
          <DialogHeader className="sr-only">
            <DialogTitle>작업 기록 수정</DialogTitle>
            <DialogDescription>
              선택한 작업 기록을 고치거나 삭제합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto p-5">
            {selectedLog ? (
              <QuickLogForm
                key={selectedLog.id}
                idPrefix="edit-log"
                projectTitle={projectTitle}
                eyebrow="기록 수정"
                submitLabel="변경 저장"
                initialLoggedOn={selectedLog.date}
                initialRow={selectedLog.currentRow}
                initialPercent={selectedLog.progressPercent}
                initialMemo={selectedLog.memo ?? ""}
                existingPhotoUrl={selectedLog.photoUrl}
                existingPhotoStoragePath={selectedLog.photoStoragePath}
                isSubmitting={isSaving}
                isDeleting={isDeleting}
                onCancel={() => {
                  if (!isSaving && !isDeleting) {
                    setSelectedLog(null);
                  }
                }}
                onSubmit={async (values) => {
                  await onUpdate(selectedLog.id, values);
                  setSelectedLog(null);
                }}
                onDelete={async () => {
                  const confirmed = window.confirm(
                    "이 작업 기록을 삭제할까요? 사진도 함께 삭제돼요."
                  );
                  if (!confirmed) {
                    return;
                  }
                  await onDelete(selectedLog.id);
                  setSelectedLog(null);
                }}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectLogList;
