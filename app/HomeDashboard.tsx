"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HomeAiTeaser from "@/components/knitbook/home/HomeAiTeaser";
import HomeGreeting from "@/components/knitbook/home/HomeGreeting";
import InProgressSection from "@/components/knitbook/home/InProgressSection";
import RecentPatternsSection from "@/components/knitbook/home/RecentPatternsSection";
import YarnSummarySection from "@/components/knitbook/home/YarnSummarySection";
import {
  HOME_PROJECT_VISIBLE_LIMIT,
  sortProjectsByLatestWork,
} from "@/components/knitbook/home/constants";
import QuickLogForm, {
  type QuickLogValues,
} from "@/components/knitbook/projects/QuickLogForm";
import type {
  Pattern,
  Project,
  YarnInventorySummary,
} from "@/components/knitbook/types";
import { fetchProjects, saveWorkLog } from "@/lib/knitbook/project-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type HomeDashboardProps = {
  nickname: string;
  initialProjects: Project[];
  initialProjectsError?: string | null;
  initialPatterns: Pattern[];
  initialYarnSummary: YarnInventorySummary;
};

/**
 * 최근 업데이트순으로 홈에 보여줄 작품만 남긴다.
 */
const takeLatestProjects = (items: Project[]) => {
  return sortProjectsByLatestWork(items).slice(0, HOME_PROJECT_VISIBLE_LIMIT);
};

/**
 * 홈 대시보드(인사·작품·도안·실·AI 안내)를 조립한다.
 */
const HomeDashboard = ({
  nickname,
  initialProjects,
  initialProjectsError,
  initialPatterns,
  initialYarnSummary,
}: HomeDashboardProps) => {
  const router = useRouter();
  const [projectsSource, setProjectsSource] = useState(initialProjects);
  const [projects, setProjects] = useState(() =>
    takeLatestProjects(initialProjects)
  );
  const [projectsError, setProjectsError] = useState<string | null>(
    initialProjectsError ?? null
  );
  const [isLoadingProjects, setIsLoadingProjects] = useState(
    initialProjects.length === 0 && !initialProjectsError
  );
  const [logOpen, setLogOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isSavingLog, setIsSavingLog] = useState(false);

  if (initialProjects !== projectsSource) {
    setProjectsSource(initialProjects);
    setProjects(takeLatestProjects(initialProjects));
    setProjectsError(initialProjectsError ?? null);
    setIsLoadingProjects(initialProjects.length === 0 && !initialProjectsError);
  }

  /**
   * 작품 탭과 같은 클라이언트 조회로 홈 목록을 다시 채운다.
   */
  const reloadProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    setProjectsError(null);
    try {
      const next = await fetchProjects();
      setProjects(takeLatestProjects(next));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[홈 작품 다시 불러오기 실패]", error);
      }
      setProjectsError("작품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    if (initialProjects.length > 0 || initialProjectsError) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const next = await fetchProjects();
        if (cancelled) {
          return;
        }
        setProjects(takeLatestProjects(next));
        setProjectsError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (process.env.NODE_ENV === "development") {
          console.error("[홈 작품 다시 불러오기 실패]", error);
        }
        setProjectsError("작품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      } finally {
        if (!cancelled) {
          setIsLoadingProjects(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [initialProjects.length, initialProjectsError]);

  const openQuickLog = (projectId: string) => {
    const target = projects.find((project) => project.id === projectId) ?? null;
    if (!target) {
      return;
    }

    setActiveProject(target);
    setLogOpen(true);
  };

  const handleQuickLogSubmit = async (values: QuickLogValues) => {
    if (!activeProject) {
      return;
    }

    setIsSavingLog(true);
    try {
      const { project } = await saveWorkLog(activeProject.id, values);

      setProjects((prev) =>
        takeLatestProjects(
          prev.map((item) => (item.id === project.id ? { ...item, ...project } : item))
        )
      );

      setLogOpen(false);
      setActiveProject(null);
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
    <div className="space-y-4 pb-2">
      <HomeGreeting nickname={nickname} />

      <InProgressSection
        projects={projects}
        isLoading={isLoadingProjects}
        errorMessage={projectsError}
        onRetry={() => {
          void reloadProjects();
        }}
        onQuickLog={(projectId) => openQuickLog(projectId)}
      />

      <RecentPatternsSection patterns={initialPatterns} />

      <YarnSummarySection summary={initialYarnSummary} />

      <HomeAiTeaser />

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
              단수와 메모를 빠르게 남깁니다.
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

export default HomeDashboard;
