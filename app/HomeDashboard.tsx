"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeGreeting from "@/components/knitbook/home/HomeGreeting";
import InProgressSection from "@/components/knitbook/home/InProgressSection";
import RecentPatternsSection from "@/components/knitbook/home/RecentPatternsSection";
import YarnSummarySection from "@/components/knitbook/home/YarnSummarySection";
import QuickLogForm, {
  type QuickLogValues,
} from "@/components/knitbook/projects/QuickLogForm";
import type {
  Pattern,
  Project,
  YarnInventorySummary,
} from "@/components/knitbook/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Sparkles } from "lucide-react";

type HomeDashboardProps = {
  nickname: string;
  initialProjects: Project[];
  initialPatterns: Pattern[];
  initialYarnSummary: YarnInventorySummary;
};

/**
 * PRD 홈 대시보드(인사·작품·빠른 기록·도안·실·AI 안내)를 조립한다.
 */
const HomeDashboard = ({
  nickname,
  initialProjects,
  initialPatterns,
  initialYarnSummary,
}: HomeDashboardProps) => {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [logOpen, setLogOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isSavingLog, setIsSavingLog] = useState(false);

  const hasProjects = useMemo(() => projects.length > 0, [projects.length]);

  const openQuickLog = (projectId?: string) => {
    const target =
      projects.find((project) => project.id === projectId) ??
      projects[0] ??
      null;

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
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("로그인이 만료되었어요. 다시 로그인해 주세요.");
      }

      const { error: logError } = await supabase.from("project_logs").insert({
        project_id: activeProject.id,
        row_count: values.currentRow,
        progress_percent: values.progressPercent,
        work_minutes: values.durationMinutes,
        memo: values.memo || null,
      });

      if (logError) {
        throw logError;
      }

      const projectPatch: {
        current_row?: number | null;
        progress_percent?: number | null;
        notes?: string | null;
      } = {};

      if (values.currentRow !== null) {
        projectPatch.current_row = values.currentRow;
      }
      if (values.progressPercent !== null) {
        projectPatch.progress_percent = values.progressPercent;
      }
      if (values.memo.trim()) {
        projectPatch.notes = values.memo.trim();
      }

      if (Object.keys(projectPatch).length > 0) {
        const { error: projectError } = await supabase
          .from("projects")
          .update(projectPatch)
          .eq("id", activeProject.id)
          .eq("user_id", user.id);

        if (projectError) {
          throw projectError;
        }
      }

      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== activeProject.id) {
            return project;
          }

          return {
            ...project,
            currentRow: values.currentRow ?? project.currentRow,
            progressPercent:
              values.progressPercent ?? project.progressPercent,
            lastNote: values.memo.trim() || project.lastNote,
            lastWorkedAt: new Date().toISOString(),
          };
        })
      );

      setLogOpen(false);
      setActiveProject(null);
      router.refresh();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[빠른 기록 저장 실패]", error);
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
    <div className="space-y-8 pb-2">
      <HomeGreeting nickname={nickname} />

      <InProgressSection
        projects={projects}
        onQuickLog={(projectId) => openQuickLog(projectId)}
      />

      <section className="space-y-3" aria-labelledby="quick-log-heading">
        <h2 id="quick-log-heading" className="text-base font-medium">
          빠른 기록
        </h2>
        <Button
          type="button"
          variant="secondary"
          className="h-12 w-full justify-start gap-2"
          onClick={() => openQuickLog()}
          disabled={!hasProjects}
        >
          <Plus className="size-4" aria-hidden />
          작업 기록
        </Button>
        {!hasProjects ? (
          <p className="text-xs text-muted-foreground">
            진행 중인 작품이 있으면 바로 단수를 남길 수 있어요.
          </p>
        ) : null}
      </section>

      <RecentPatternsSection patterns={initialPatterns} />

      <YarnSummarySection summary={initialYarnSummary} />

      <section className="space-y-3" aria-labelledby="ai-teaser-heading">
        <h2 id="ai-teaser-heading" className="text-base font-medium">
          AI 추천
        </h2>
        <Card size="sm" className="border-dashed">
          <CardHeader className="flex-row items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Sparkles className="size-4" aria-hidden />
            </span>
            <div className="space-y-1">
              <CardTitle className="text-sm">곧 만나요</CardTitle>
              <CardDescription>
                &ldquo;이 실로 베스트를 만들어보세요.&rdquo; 같은 맞춤 추천은
                도안·실 데이터가 쌓인 뒤 제공될 예정이에요.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              nativeButton={false}
              render={<Link href="/ai" />}
            >
              AI 메뉴 미리보기
            </Button>
          </CardContent>
        </Card>
      </section>

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
          <div className="p-5">
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
