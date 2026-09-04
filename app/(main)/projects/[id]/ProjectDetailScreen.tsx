"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Pattern, Project, ProjectStatus, WorkLog, Yarn } from "@/components/knitbook/types";
import ProjectCard from "@/components/knitbook/projects/ProjectCard";
import ProjectForm, {
  projectToFormValues,
} from "@/components/knitbook/projects/ProjectForm";
import ProjectLogList from "@/components/knitbook/projects/ProjectLogList";
import QuickLogForm from "@/components/knitbook/projects/QuickLogForm";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import {
  deleteProject,
  saveWorkLog,
  updateProject,
  updateProjectStatus,
} from "@/lib/knitbook/project-client";
import {
  showNetworkErrorToast,
  showSuccessToast,
} from "@/lib/knitbook/use-knitbook-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";

type ProjectDetailScreenProps = {
  initialProject: Project;
  initialLogs: WorkLog[];
  patterns: Pattern[];
  yarns: Yarn[];
};

/**
 * 작품 상세·진행 기록·도안/실 연결 화면을 구성한다.
 */
const ProjectDetailScreen = ({
  initialProject,
  initialLogs,
  patterns,
  yarns,
}: ProjectDetailScreenProps) => {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [logs, setLogs] = useState(initialLogs);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingLog, setIsSavingLog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `"${project.title}" 작품을 삭제할까요? 작업 기록과 실 연결도 함께 삭제돼요.`
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      showSuccessToast("작품을 삭제했어요");
      router.push("/projects");
      router.refresh();
    } catch (error) {
      showNetworkErrorToast(error, "작품을 삭제하지 못했어요");
      setErrorMessage("작품을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (status: ProjectStatus) => {
    if (status === project.status) {
      return;
    }
    setIsUpdating(true);
    try {
      const next = await updateProjectStatus(project.id, status);
      setProject(next);
      showSuccessToast("작품 상태를 바꿨어요");
      router.refresh();
    } catch (error) {
      showNetworkErrorToast(error, "작품 상태를 바꾸지 못했어요");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => setIsEditing(false)}
          disabled={isSaving}
        >
          <ChevronLeft data-icon="inline-start" />
          상세로
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>작품 수정</CardTitle>
            <CardDescription>도안, 실, 진행 정보를 업데이트해요.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm
              patterns={patterns}
              yarns={yarns}
              initialValues={projectToFormValues(project)}
              currentImageUrl={project.coverImageUrl}
              isSubmitting={isSaving}
              submitLabel="변경 저장"
              onSubmit={async (values) => {
                setIsSaving(true);
                try {
                  const next = await updateProject(project.id, values);
                  setProject(next);
                  setIsEditing(false);
                  showSuccessToast("작품 정보를 수정했어요");
                  router.refresh();
                } catch (error) {
                  showNetworkErrorToast(error, "작품을 수정하지 못했어요");
                  throw error instanceof Error
                    ? error
                    : new Error("작품을 수정하지 못했어요. 잠시 후 다시 시도해 주세요.");
                } finally {
                  setIsSaving(false);
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          nativeButton={false}
          render={<Link href="/projects" />}
        >
          <ChevronLeft data-icon="inline-start" />
          작품 목록
        </Button>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsEditing(true)}
            aria-label="작품 수정"
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
            aria-label="작품 삭제"
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      {errorMessage ? (
        <ErrorState title="처리하지 못했어요" message={errorMessage} />
      ) : null}

      <ProjectCard
        project={project}
        isUpdating={isUpdating}
        onStatusChange={(status) => void handleStatusChange(status)}
      />

      <Card size="sm">
        <CardHeader>
          <CardTitle>작업 기록</CardTitle>
          <CardDescription>뜨개를 멈출 때 단수와 메모를 남겨요.</CardDescription>
        </CardHeader>
        <CardContent>
          <QuickLogForm
            projectTitle={project.title}
            initialRow={project.currentRow}
            initialPercent={project.progressPercent}
            isSubmitting={isSavingLog}
            onSubmit={async (values) => {
              setIsSavingLog(true);
              try {
                const result = await saveWorkLog(project.id, values);
                setProject(result.project);
                setLogs((prev) => [result.log, ...prev]);
                showSuccessToast("작업 기록을 남겼어요");
                router.refresh();
              } catch (error) {
                showNetworkErrorToast(error, "작업 기록을 저장하지 못했어요");
                throw error instanceof Error
                  ? error
                  : new Error("작업 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
              } finally {
                setIsSavingLog(false);
              }
            }}
          />
        </CardContent>
      </Card>

      <section className="space-y-3" aria-labelledby="project-logs-heading">
        <h2 id="project-logs-heading" className="text-base font-medium">
          최근 기록
        </h2>
        <ProjectLogList logs={logs} />
      </section>
    </div>
  );
};

export default ProjectDetailScreen;
