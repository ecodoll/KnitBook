"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Project, ProjectStatus } from "@/components/knitbook/types";
import ProjectList from "@/components/knitbook/projects/ProjectList";
import QuickLogForm, {
  type QuickLogValues,
} from "@/components/knitbook/projects/QuickLogForm";
import { fetchProjects, saveWorkLog } from "@/lib/knitbook/project-client";
import {
  showNetworkErrorToast,
  showSuccessToast,
} from "@/lib/knitbook/use-knitbook-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

type ProjectsScreenProps = {
  initialProjects: Project[];
};

/**
 * 상태 탭과 작품 목록, 빠른 기록 화면을 구성한다.
 */
const ProjectsScreen = ({ initialProjects }: ProjectsScreenProps) => {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [projectsSource, setProjectsSource] = useState(initialProjects);
  const [activeStatus, setActiveStatus] = useState<ProjectStatus | "all">(
    "all"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isSavingLog, setIsSavingLog] = useState(false);

  if (initialProjects !== projectsSource) {
    setProjectsSource(initialProjects);
    setProjects(initialProjects);
  }

  const reloadProjects = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const next = await fetchProjects();
      setProjects(next);
    } catch (error) {
      const message = "작품 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";
      setErrorMessage(message);
      showNetworkErrorToast(error, message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const visibleProjects = useMemo(() => {
    if (activeStatus === "all") {
      return projects;
    }
    return projects.filter((project) => project.status === activeStatus);
  }, [projects, activeStatus]);

  const handleQuickLogSubmit = async (values: QuickLogValues) => {
    if (!activeProject) {
      return;
    }

    setIsSavingLog(true);
    try {
      const { project } = await saveWorkLog(activeProject.id, values);
      setProjects((prev) =>
        prev.map((item) => (item.id === project.id ? { ...item, ...project } : item))
      );
      setLogOpen(false);
      setActiveProject(null);
      showSuccessToast("작업 기록을 남겼어요");
      router.refresh();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[작업 기록 저장 실패]", error);
      }
      throw new Error(
        error instanceof Error
          ? error.message
          : "작업 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setIsSavingLog(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">작품</h1>
          <p className="text-sm text-muted-foreground">
            진행 중인 작품을 기록하고 도안·실과 연결해요.
          </p>
        </div>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/projects/new" />}
        >
          <Plus data-icon="inline-start" />
          새 작품
        </Button>
      </div>

      <ProjectList
        projects={visibleProjects}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onRetry={() => void reloadProjects()}
        onQuickLog={(projectId) => {
          const target = projects.find((project) => project.id === projectId);
          if (!target) {
            return;
          }
          setActiveProject(target);
          setLogOpen(true);
        }}
      />

      <Dialog
        open={logOpen}
        onOpenChange={(open) => {
          setLogOpen(open);
          if (!open) {
            setActiveProject(null);
          }
        }}
      >
        <DialogContent className="max-w-md gap-0 p-0 sm:max-w-md">
          <DialogHeader className="sr-only">
            <DialogTitle>작업 기록</DialogTitle>
            <DialogDescription>
              현재 단수와 진행률을 빠르게 남깁니다.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto p-5">
            {activeProject ? (
              <QuickLogForm
                projectTitle={activeProject.title}
                initialRow={activeProject.currentRow}
                initialPercent={activeProject.progressPercent}
                onSubmit={handleQuickLogSubmit}
                onCancel={() => setLogOpen(false)}
                isSubmitting={isSavingLog}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsScreen;
