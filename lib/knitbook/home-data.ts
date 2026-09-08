import { cache } from "react";
import type {
  Pattern,
  Project,
  YarnInventorySummary,
} from "@/components/knitbook/types";
import type { AppHeaderUser } from "@/components/knitbook/layout/AppHeader";
import { getAppHeaderUser, getAuthUser } from "@/lib/knitbook/app-user";
import {
  HOME_PATTERN_VISIBLE_LIMIT,
  HOME_PROJECT_VISIBLE_LIMIT,
  sortProjectsByLatestWork,
} from "@/components/knitbook/home/constants";
import { getProjectsPageData } from "@/lib/knitbook/project-data";
import { getPatternsPageData } from "@/lib/knitbook/pattern-data";
import { getYarnsPageData } from "@/lib/knitbook/yarn-data";
import { buildYarnInventorySummary } from "@/lib/knitbook/yarns/summary";

export type HomeDashboardData = {
  user: AppHeaderUser;
  projects: Project[];
  projectsError: string | null;
  patterns: Pattern[];
  patternsError: string | null;
  yarnSummary: YarnInventorySummary;
  yarnsError: string | null;
};

/**
 * 작품 탭과 같은 목록을 읽어 홈용 최근 3개로 줄인다.
 */
const loadHomeProjects = async (): Promise<{
  projects: Project[];
  errorMessage: string | null;
}> => {
  try {
    const data = await getProjectsPageData();
    return {
      projects: sortProjectsByLatestWork(data?.projects ?? []).slice(
        0,
        HOME_PROJECT_VISIBLE_LIMIT
      ),
      errorMessage: null,
    };
  } catch (error) {
    console.error("[홈 작품 조회 실패]", error);
    return {
      projects: [],
      errorMessage: "작품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
};

/**
 * 도안 탭과 같은 목록을 읽어 홈에 보여줄 도안으로 줄인다.
 */
const loadHomePatterns = async (): Promise<{
  patterns: Pattern[];
  errorMessage: string | null;
}> => {
  try {
    const data = await getPatternsPageData();
    if (!data) {
      return {
        patterns: [],
        errorMessage: "도안을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
      };
    }

    return {
      patterns: data.patterns.slice(0, HOME_PATTERN_VISIBLE_LIMIT),
      errorMessage: null,
    };
  } catch (error) {
    console.error("[홈 도안 조회 실패]", error);
    return {
      patterns: [],
      errorMessage: "도안을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
};

/**
 * 실 탭과 같은 목록을 읽어 홈 요약을 만든다.
 */
const loadHomeYarns = async (): Promise<{
  summary: YarnInventorySummary;
  errorMessage: string | null;
}> => {
  try {
    const data = await getYarnsPageData();
    return {
      summary: buildYarnInventorySummary(data?.yarns ?? []),
      errorMessage: null,
    };
  } catch (error) {
    console.error("[홈 실 조회 실패]", error);
    return {
      summary: buildYarnInventorySummary([]),
      errorMessage: "실 재고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
};

/**
 * 로그인한 사용자의 홈 대시보드 데이터를 불러온다.
 */
const getHomeDashboardData = cache(async (): Promise<HomeDashboardData | null> => {
  const user = await getAuthUser();
  if (!user) {
    return null;
  }

  const [headerUser, projectResult, patternResult, yarnResult] = await Promise.all([
    getAppHeaderUser(),
    loadHomeProjects(),
    loadHomePatterns(),
    loadHomeYarns(),
  ]);

  if (!headerUser) {
    return null;
  }

  return {
    user: headerUser,
    projects: projectResult.projects,
    projectsError: projectResult.errorMessage,
    patterns: patternResult.patterns,
    patternsError: patternResult.errorMessage,
    yarnSummary: yarnResult.summary,
    yarnsError: yarnResult.errorMessage,
  };
});

export { getHomeDashboardData };
