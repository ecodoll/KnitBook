"use client";

import { useState } from "react";
import Link from "next/link";
import { SAMPLE_HEADER_USER } from "@/components/knitbook/layout/AppHeader";
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

/** 홈 대시보드용 임시 샘플 데이터 (API 연동 전) */
const SAMPLE_NICKNAME = SAMPLE_HEADER_USER.nickname;

const SAMPLE_PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "Winter Cardigan",
    status: "in_progress",
    progressPercent: 72,
    currentRow: 42,
    totalRows: 55,
    lastWorkedAt: "2026-08-07T20:30:00.000Z",
    lastNote: "몸통 끝부분 진행 중",
    patternTitle: "Winter Cardigan Pattern",
  },
  {
    id: "proj-2",
    title: "소프트 머플러",
    status: "in_progress",
    progressPercent: 35,
    currentRow: 28,
    totalRows: 80,
    lastWorkedAt: "2026-08-05T14:00:00.000Z",
    lastNote: "고무단 완료",
  },
];

const SAMPLE_PATTERNS: Pattern[] = [
  {
    id: "pat-1",
    title: "Winter Cardigan",
    designer: "Knit Studio",
    difficulty: 3,
    isFavorite: true,
    createdAt: "2026-07-01T00:00:00.000Z",
    lastOpenedAt: "2026-08-07T20:00:00.000Z",
  },
  {
    id: "pat-2",
    title: "리브 비니",
    designer: "Soft Loop",
    difficulty: 2,
    createdAt: "2026-06-12T00:00:00.000Z",
    lastOpenedAt: "2026-08-04T10:00:00.000Z",
  },
  {
    id: "pat-3",
    title: "여름 베스트",
    designer: "Yarn Days",
    difficulty: 4,
    createdAt: "2026-05-20T00:00:00.000Z",
    lastOpenedAt: "2026-08-01T09:00:00.000Z",
  },
];

const SAMPLE_YARN_SUMMARY: YarnInventorySummary = {
  totalKinds: 38,
  totalRemainingGrams: 4250,
  lowStockCount: 2,
  recentYarns: [
    {
      id: "yarn-1",
      brand: "Drops",
      productName: "Alaska",
      colorName: "Grey",
      remainingGrams: 320,
    },
    {
      id: "yarn-2",
      brand: "Rowan",
      productName: "Felted Tweed",
      colorName: "Clay",
      remainingGrams: 150,
    },
    {
      id: "yarn-3",
      brand: "다카야마",
      productName: "코튼 블렌드",
      colorName: "아이보리",
      remainingGrams: 80,
      isInUse: true,
    },
  ],
};

/**
 * PRD 홈 대시보드(인사·작품·빠른 기록·도안·실·AI 안내)를 조립한다.
 */
const HomeDashboard = () => {
  const [logOpen, setLogOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isSavingLog, setIsSavingLog] = useState(false);

  const openQuickLog = (projectId?: string) => {
    const target =
      SAMPLE_PROJECTS.find((project) => project.id === projectId) ??
      SAMPLE_PROJECTS[0] ??
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
      // TODO: Supabase 작업 기록 API 연동
      if (process.env.NODE_ENV === "development") {
        console.info("[빠른 기록 저장]", {
          projectId: activeProject.id,
          ...values,
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 350));
      setLogOpen(false);
      setActiveProject(null);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[빠른 기록 저장 실패]", error);
      }
      throw new Error(
        "작업 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setIsSavingLog(false);
    }
  };

  return (
    <div className="space-y-8 pb-2">
      <HomeGreeting nickname={SAMPLE_NICKNAME} />

      <InProgressSection
        projects={SAMPLE_PROJECTS}
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
          disabled={SAMPLE_PROJECTS.length === 0}
        >
          <Plus className="size-4" aria-hidden />
          작업 기록
        </Button>
        {SAMPLE_PROJECTS.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            진행 중인 작품이 있으면 바로 단수를 남길 수 있어요.
          </p>
        ) : null}
      </section>

      <RecentPatternsSection patterns={SAMPLE_PATTERNS} />

      <YarnSummarySection summary={SAMPLE_YARN_SUMMARY} />

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
