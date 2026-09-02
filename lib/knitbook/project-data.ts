import { cache } from "react";
import type { Project, WorkLog } from "@/components/knitbook/types";
import { getAuthUser } from "@/lib/knitbook/app-user";
import {
  PROJECT_DETAIL_SELECT,
  PROJECT_SELECT,
} from "@/lib/knitbook/projects/constants";
import {
  mapProject,
  mapWorkLog,
  type ProjectLogRow,
  type ProjectRow,
} from "@/lib/knitbook/projects/map-project";
import {
  attachSignedProjectCovers,
  attachSignedWorkLogPhotos,
} from "@/lib/knitbook/projects/signed-url";
import { createClient } from "@/lib/supabase/server";

export type ProjectsPageData = {
  projects: Project[];
};

export type ProjectDetailPageData = {
  project: Project;
  logs: WorkLog[];
};

export type YarnLinkedProject = {
  id: string;
  title: string;
  status: Project["status"];
};

/**
 * 작품별 최신 작업 기록을 조회한다.
 */
const loadLatestLogs = async (projectIds: string[]) => {
  const latestLogsByProject = new Map<string, ProjectLogRow>();
  if (projectIds.length === 0) {
    return latestLogsByProject;
  }

  const supabase = await createClient();
  const { data: logRows, error } = await supabase
    .from("project_logs")
    .select("id, project_id, logged_on, row_count, progress_percent, work_minutes, photo_url, memo, created_at")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false })
    .limit(Math.max(projectIds.length * 8, 24));

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작업 기록 조회 실패]", error.message);
    }
    return latestLogsByProject;
  }

  for (const log of (logRows ?? []) as ProjectLogRow[]) {
    if (!latestLogsByProject.has(log.project_id)) {
      latestLogsByProject.set(log.project_id, log);
    }
  }

  return latestLogsByProject;
};

/**
 * 로그인한 사용자의 작품 목록을 불러온다.
 */
const getProjectsPageData = cache(async (): Promise<ProjectsPageData | null> => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(`${PROJECT_SELECT}, patterns(id, title)`)
    .eq("user_id", authUser.id)
    .order("updated_at", { ascending: false });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 목록 조회 실패]", error.message);
    }
    throw new Error("작품 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  const rows = (data ?? []) as ProjectRow[];
  const latestLogs = await loadLatestLogs(rows.map((row) => row.id));

  const projects = await attachSignedProjectCovers(
    supabase,
    rows.map((row) => mapProject(row, latestLogs.get(row.id) ?? null))
  );

  return {
    projects,
  };
});

/**
 * 작품 상세·작업 기록·연결 실을 불러온다.
 */
const getProjectDetailPageData = cache(async (
  projectId: string
): Promise<ProjectDetailPageData | null> => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_DETAIL_SELECT)
    .eq("id", projectId)
    .eq("user_id", authUser.id)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 상세 조회 실패]", error.message);
    }
    throw new Error("작품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  if (!data) {
    return null;
  }

  const { data: logRows, error: logsError } = await supabase
    .from("project_logs")
    .select("id, project_id, logged_on, row_count, progress_percent, work_minutes, photo_url, memo, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (logsError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 기록 조회 실패]", logsError.message);
    }
    throw new Error("작업 기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  const typedLogs = (logRows ?? []) as ProjectLogRow[];

  const [project] = await attachSignedProjectCovers(supabase, [
    mapProject(data as ProjectRow, typedLogs[0] ?? null),
  ]);

  return {
    project,
    logs: await attachSignedWorkLogPhotos(supabase, typedLogs.map(mapWorkLog)),
  };
});

/**
 * 특정 실을 사용 중인 작품 목록을 불러온다.
 */
const getYarnLinkedProjects = cache(async (
  yarnId: string
): Promise<YarnLinkedProject[]> => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_yarns")
    .select("project_id, projects(id, title, status, user_id)")
    .eq("yarn_id", yarnId);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[실 연결 작품 조회 실패]", error.message);
    }
    return [];
  }

  type LinkRow = {
    projects?:
      | {
          id: string;
          title: string;
          status: Project["status"];
          user_id: string;
        }
      | {
          id: string;
          title: string;
          status: Project["status"];
          user_id: string;
        }[]
      | null;
  };

  const normalizeProject = (value: LinkRow["projects"]) => {
    if (!value) {
      return null;
    }
    return Array.isArray(value) ? value[0] ?? null : value;
  };

  return ((data ?? []) as unknown as LinkRow[])
    .map((row) => normalizeProject(row.projects))
    .filter((project): project is NonNullable<ReturnType<typeof normalizeProject>> => {
      return Boolean(project && project.user_id === authUser.id);
    })
    .map((project) => ({
      id: project.id,
      title: project.title,
      status: project.status,
    }));
});

export { getProjectsPageData, getProjectDetailPageData, getYarnLinkedProjects };
