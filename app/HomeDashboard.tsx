"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HomeAiTeaser from "@/components/knitbook/home/HomeAiTeaser";
import HomeGreeting from "@/components/knitbook/home/HomeGreeting";
import InProgressSection from "@/components/knitbook/home/InProgressSection";
import RecentPatternsSection from "@/components/knitbook/home/RecentPatternsSection";
import YarnSummarySection from "@/components/knitbook/home/YarnSummarySection";
import { sortProjectsByLatestWork } from "@/components/knitbook/home/constants";
import QuickLogForm, {
  type QuickLogValues,
} from "@/components/knitbook/projects/QuickLogForm";
import type {
  Pattern,
  Project,
  YarnInventorySummary,
} from "@/components/knitbook/types";
import { saveWorkLog } from "@/lib/knitbook/project-client";
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
  initialPatterns: Pattern[];
  initialYarnSummary: YarnInventorySummary;
};

/**
 * 홈 대시보드(인사·작품·도안·실·AI 안내)를 조립한다.
 */
const HomeDashboard = ({
  nickname,
  initialProjects,
  initialPatterns,
  initialYarnSummary,
}: HomeDashboardProps) => {
  const router = useRouter();
  const [projectsSource, setProjectsSource] = useState(initialProjects);
  const [projects, setProjects] = useState(() =>
    sortProjectsByLatestWork(initialProjects)
  );
  const [logOpen, setLogOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isSavingLog, setIsSavingLog] = useState(false);

  if (initialProjects !== projectsSource) {
    setProjectsSource(initialProjects);
    setProjects(sortProjectsByLatestWork(initialProjects));
  }

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
        sortProjectsByLatestWork(
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

export default HomeDashboard;
