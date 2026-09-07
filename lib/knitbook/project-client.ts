"use client";

import type { Project, ProjectStatus, WorkLog } from "@/components/knitbook/types";
import type { QuickLogValues } from "@/components/knitbook/projects/QuickLogForm";
import type { ProjectFormValues } from "@/components/knitbook/projects/ProjectForm";
import {
  buildProjectLogPhotoPath,
  PROJECT_DETAIL_SELECT,
  PROJECT_DETAIL_SELECT_CORE,
  PROJECT_IMAGE_BUCKETS,
  PROJECT_LIST_SELECT,
  PROJECT_LIST_SELECT_CORE,
  PROJECT_LOG_SELECT,
  PROJECT_SELECT_CORE,
} from "@/lib/knitbook/projects/constants";
import {
  hasLogPhoto,
  mapProject,
  mapWorkLog,
  pickLatestLogs,
  type ProjectLogRow,
  type ProjectRow,
} from "@/lib/knitbook/projects/map-project";
import {
  attachSignedProjectCovers,
  attachSignedWorkLogPhotos,
  createSignedProjectCoverUrl,
} from "@/lib/knitbook/projects/signed-url";
import { mapYarnImageUploadError } from "@/lib/knitbook/yarns/constants";
import { prepareYarnImageFile } from "@/lib/knitbook/yarns/prepare-image";
import { createClient } from "@/lib/supabase/client";
import {
  selectWithGaugeFallback,
  writeWithGaugeFallback,
} from "@/lib/knitbook/projects/query";

/**
 * 로그인 사용자 ID를 반환한다. 없으면 오류를 던진다.
 */
const requireUserId = async () => {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("로그인이 필요해요. 다시 로그인해 주세요.");
  }

  return { supabase, userId: user.id };
};

/**
 * 빈 문자열을 null로 바꾼다.
 */
const emptyToNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

/**
 * 폼 숫자 입력을 number 또는 null로 변환한다.
 */
const parseOptionalNumber = (value: string, label: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label}은(는) 숫자로 입력해 주세요.`);
  }
  if (parsed < 0) {
    throw new Error(`${label}은(는) 0 이상이어야 해요.`);
  }
  return parsed;
};

/**
 * 실의 사용 중 여부를 연결 작품 수에 맞춰 갱신한다.
 */
const refreshYarnInUse = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
  yarnIds: string[]
) => {
  const uniqueIds = [...new Set(yarnIds.filter(Boolean))];
  await Promise.all(
    uniqueIds.map(async (yarnId) => {
      const { count, error } = await supabase
        .from("project_yarns")
        .select("id", { count: "exact", head: true })
        .eq("yarn_id", yarnId);

      if (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[실 사용 중 여부 조회 실패]", error);
        }
        return;
      }

      const { error: updateError } = await supabase
        .from("yarns")
        .update({ is_in_use: (count ?? 0) > 0 })
        .eq("id", yarnId)
        .eq("user_id", userId);

      if (updateError && process.env.NODE_ENV === "development") {
        console.error("[실 사용 중 여부 갱신 실패]", updateError);
      }
    })
  );
};

/**
 * 작품에 연결된 실을 교체한다.
 */
const replaceProjectYarns = async (
  supabase: ReturnType<typeof createClient>,
  projectId: string,
  userId: string,
  yarns: ProjectFormValues["yarns"],
  previousYarnIds: string[] = []
) => {
  const nextIds = yarns.map((item) => item.yarnId);

  const { error: deleteError } = await supabase
    .from("project_yarns")
    .delete()
    .eq("project_id", projectId);

  if (deleteError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 실 연결 삭제 실패]", deleteError);
    }
    throw new Error("작품에 연결한 실을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  if (yarns.length > 0) {
    const { error: insertError } = await supabase.from("project_yarns").insert(
      yarns.map((item) => ({
        project_id: projectId,
        yarn_id: item.yarnId,
        planned_quantity: parseOptionalNumber(item.plannedQuantity, "예정 수량"),
        used_quantity: parseOptionalNumber(item.usedQuantity, "사용 수량"),
      }))
    );

    if (insertError) {
      if (process.env.NODE_ENV === "development") {
        console.error("[작품 실 연결 실패]", insertError);
      }
      throw new Error("작품에 실을 연결하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  await refreshYarnInUse(supabase, userId, [...previousYarnIds, ...nextIds]);
};

/**
 * 폼 값을 projects 테이블 payload로 변환한다.
 */
const toProjectWritePayload = (values: ProjectFormValues, userId: string) => {
  const status = values.status;
  const progress = parseOptionalNumber(values.progressPercent, "진행률") ?? 0;
  if (progress > 100) {
    throw new Error("진행률은 100 이하여야 해요.");
  }

  return {
    user_id: userId,
    title: values.title.trim(),
    pattern_id: emptyToNull(values.patternId),
    status,
    progress_percent: progress,
    current_row: parseOptionalNumber(values.currentRow, "현재 단수"),
    total_row: parseOptionalNumber(values.totalRows, "총 단수"),
    size: emptyToNull(values.size),
    started_at: emptyToNull(values.startedAt),
    target_date: emptyToNull(values.targetDate),
    completed_at:
      status === "completed"
        ? emptyToNull(values.completedAt) ?? new Date().toISOString().slice(0, 10)
        : null,
    notes: emptyToNull(values.notes),
    gauge_stitches: parseOptionalNumber(values.gaugeStitches, "게이지 코수"),
    gauge_rows: parseOptionalNumber(values.gaugeRows, "게이지 단수"),
  };
};

/**
 * 작품 대표 사진을 사용 가능한 Storage 버킷에 올린다.
 */
const uploadProjectCoverToAvailableBucket = async (
  supabase: ReturnType<typeof createClient>,
  storagePath: string,
  body: Blob,
  contentType: string
) => {
  let lastError: { message?: string } | null = null;

  for (const bucket of PROJECT_IMAGE_BUCKETS) {
    const { error } = await supabase.storage.from(bucket).upload(storagePath, body, {
      contentType,
      cacheControl: "3600",
      upsert: true,
    });

    if (!error) {
      return;
    }

    lastError = error;
    if (process.env.NODE_ENV === "development") {
      console.error(`[작품 사진 업로드 실패:${bucket}]`, error);
    }
  }

  throw new Error(mapYarnImageUploadError(lastError ?? {}));
};

/**
 * 작품 사진을 모든 후보 버킷에서 지운다.
 */
const removeProjectCoverFromBuckets = async (
  supabase: ReturnType<typeof createClient>,
  storagePath: string
) => {
  for (const bucket of PROJECT_IMAGE_BUCKETS) {
    const { error } = await supabase.storage.from(bucket).remove([storagePath]);
    if (error && process.env.NODE_ENV === "development") {
      console.error(`[작품 사진 삭제 실패:${bucket}]`, error.message);
    }
  }
};

/**
 * 작품 사진 Storage 경로를 표시용 서명 URL로 만든다.
 */
const resolveProjectImageUrl = async (storagePath: string) => {
  const supabase = createClient();
  return createSignedProjectCoverUrl(supabase, storagePath);
};

/**
 * 작품에 서명된 대표 사진 URL을 붙인다.
 */
const withSignedCover = async (
  supabase: ReturnType<typeof createClient>,
  project: Project
): Promise<Project> => {
  const [signed] = await attachSignedProjectCovers(supabase, [project]);
  return signed;
};

/**
 * 작품별 최신 기록과 사진이 있는 최근 기록을 불러온다.
 */
const loadLatestLogs = async (
  supabase: ReturnType<typeof createClient>,
  projectIds: string[]
) => {
  if (projectIds.length === 0) {
    return {
      latestByProject: new Map<string, ProjectLogRow>(),
      latestPhotoByProject: new Map<string, ProjectLogRow>(),
    };
  }

  const { data: logRows, error } = await supabase
    .from("project_logs")
    .select(PROJECT_LOG_SELECT)
    .in("project_id", projectIds)
    .order("created_at", { ascending: false })
    .limit(Math.max(projectIds.length * 12, 36));

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작업 기록 조회 실패]", error);
    }
    return {
      latestByProject: new Map<string, ProjectLogRow>(),
      latestPhotoByProject: new Map<string, ProjectLogRow>(),
    };
  }

  return pickLatestLogs((logRows ?? []) as ProjectLogRow[]);
};

/**
 * 사용자의 작품 목록을 조회한다.
 */
const fetchProjects = async (): Promise<Project[]> => {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await selectWithGaugeFallback(
    (columns) =>
      supabase
        .from("projects")
        .select(columns)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false }),
    { primary: PROJECT_LIST_SELECT, fallback: PROJECT_LIST_SELECT_CORE }
  );

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 목록 조회 실패]", error);
    }
    throw new Error("작품 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  const rows = (data ?? []) as unknown as ProjectRow[];
  const { latestByProject, latestPhotoByProject } = await loadLatestLogs(
    supabase,
    rows.map((row) => row.id)
  );

  return rows.map((row) =>
    mapProject(
      row,
      latestByProject.get(row.id) ?? null,
      latestPhotoByProject.get(row.id) ?? null
    )
  );
};

/**
 * 작품 상세와 연결 실을 조회한다.
 */
const fetchProjectDetail = async (projectId: string): Promise<Project> => {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await selectWithGaugeFallback(
    (columns) =>
      supabase
        .from("projects")
        .select(columns)
        .eq("id", projectId)
        .eq("user_id", userId)
        .maybeSingle(),
    { primary: PROJECT_DETAIL_SELECT, fallback: PROJECT_DETAIL_SELECT_CORE }
  );

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 상세 조회 실패]", error);
    }
    throw new Error("작품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  if (!data) {
    throw new Error("작품 정보를 찾을 수 없어요.");
  }

  const { data: logRows, error: logsError } = await supabase
    .from("project_logs")
    .select(PROJECT_LOG_SELECT)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(24);

  if (logsError && process.env.NODE_ENV === "development") {
    console.error("[작품 기록 조회 실패]", logsError);
  }

  const typedLogs = (logRows ?? []) as ProjectLogRow[];

  return withSignedCover(
    supabase,
    mapProject(
      data as unknown as ProjectRow,
      typedLogs[0] ?? null,
      typedLogs.find((log) => hasLogPhoto(log)) ?? null
    )
  );
};

/**
 * 새 작품을 만들고 도안·실을 연결한다.
 */
const createProject = async (values: ProjectFormValues): Promise<Project> => {
  const { supabase, userId } = await requireUserId();

  const payload = toProjectWritePayload(values, userId);
  const { data, error } = await writeWithGaugeFallback(
    (nextPayload) =>
      supabase
        .from("projects")
        .insert(nextPayload)
        .select(PROJECT_SELECT_CORE)
        .single(),
    payload as Record<string, unknown>
  );

  if (error || !data) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 생성 실패]", error);
    }
    throw new Error("작품을 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  const projectId = (data as unknown as ProjectRow).id;

  try {
    await replaceProjectYarns(supabase, projectId, userId, values.yarns);
  } catch (error) {
    await supabase.from("projects").delete().eq("id", projectId).eq("user_id", userId);
    await refreshYarnInUse(
      supabase,
      userId,
      values.yarns.map((item) => item.yarnId)
    );
    throw error;
  }

  return fetchProjectDetail(projectId);
};

/**
 * 작품 정보와 연결 실을 수정한다.
 */
const updateProject = async (
  projectId: string,
  values: ProjectFormValues
): Promise<Project> => {
  const { supabase, userId } = await requireUserId();
  const current = await fetchProjectDetail(projectId);
  const previousYarnIds = (current.yarns ?? []).map((yarn) => yarn.yarnId);

  const { error } = await writeWithGaugeFallback(
    (payload) =>
      supabase
        .from("projects")
        .update(payload)
        .eq("id", projectId)
        .eq("user_id", userId),
    toProjectWritePayload(values, userId) as Record<string, unknown>
  );

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 수정 실패]", error);
    }
    throw new Error("작품을 수정하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  await replaceProjectYarns(
    supabase,
    projectId,
    userId,
    values.yarns,
    previousYarnIds
  );

  return fetchProjectDetail(projectId);
};

/**
 * 작품 상태만 변경한다.
 */
const updateProjectStatus = async (
  projectId: string,
  status: ProjectStatus
): Promise<Project> => {
  const { supabase, userId } = await requireUserId();
  const patch: {
    status: ProjectStatus;
    completed_at: string | null;
  } = {
    status,
    completed_at:
      status === "completed" ? new Date().toISOString().slice(0, 10) : null,
  };

  const { error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", projectId)
    .eq("user_id", userId);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 상태 변경 실패]", error);
    }
    throw new Error("작품 상태를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return fetchProjectDetail(projectId);
};

/**
 * 현재 단수와 진행률만 갱신한다.
 */
const updateProjectProgress = async (
  projectId: string,
  values: { currentRow?: number | null; progressPercent?: number | null }
): Promise<Project> => {
  const { supabase, userId } = await requireUserId();
  const patch: {
    current_row?: number | null;
    progress_percent?: number | null;
  } = {};

  if (values.currentRow !== undefined) {
    patch.current_row = values.currentRow;
  }
  if (values.progressPercent !== undefined) {
    patch.progress_percent = values.progressPercent;
  }

  const { error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", projectId)
    .eq("user_id", userId);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 진행률 저장 실패]", error);
    }
    throw new Error("진행 상황을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return fetchProjectDetail(projectId);
};

/**
 * 작품의 가장 최근 기록으로 현재 단수·진행률을 맞춘다.
 */
const syncProjectProgressFromLatestLog = async (
  supabase: ReturnType<typeof createClient>,
  projectId: string,
  userId: string
) => {
  const { data: latest, error } = await supabase
    .from("project_logs")
    .select(PROJECT_LOG_SELECT)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[최근 작업 기록 조회 실패]", error);
    }
    throw new Error("작업 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  if (!latest) {
    return;
  }

  const typed = latest as ProjectLogRow;
  const { error: projectError } = await supabase
    .from("projects")
    .update({
      current_row: typed.row_count,
      progress_percent: typed.progress_percent ?? 0,
    })
    .eq("id", projectId)
    .eq("user_id", userId);

  if (projectError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 진행 반영 실패]", projectError);
    }
    throw new Error("작업 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
};

/**
 * 작업 기록 사진을 Storage에 올리고 경로를 반환한다.
 */
const uploadWorkLogPhoto = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
  projectId: string,
  logId: string,
  photo: File,
  previousPath?: string | null
) => {
  const prepared = await prepareYarnImageFile(photo);
  const storagePath = buildProjectLogPhotoPath(
    userId,
    projectId,
    logId,
    prepared.extension
  );
  await uploadProjectCoverToAvailableBucket(
    supabase,
    storagePath,
    prepared.body,
    prepared.contentType
  );

  if (
    previousPath &&
    previousPath !== storagePath &&
    !previousPath.startsWith("http")
  ) {
    await removeProjectCoverFromBuckets(supabase, previousPath);
  }

  return storagePath;
};

/**
 * 한 작업 기록을 읽고, 없으면 오류를 던진다.
 */
const requireProjectLog = async (
  supabase: ReturnType<typeof createClient>,
  projectId: string,
  logId: string
) => {
  const { data, error } = await supabase
    .from("project_logs")
    .select(PROJECT_LOG_SELECT)
    .eq("id", logId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error || !data) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작업 기록 조회 실패]", error);
    }
    throw new Error("작업 기록을 찾지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return data as ProjectLogRow;
};

/**
 * 저장한 작업 기록에 서명 URL을 붙이고 작품 상세를 다시 읽는다.
 */
const finishWorkLogMutation = async (
  supabase: ReturnType<typeof createClient>,
  projectId: string,
  logRow: ProjectLogRow
) => {
  const project = await fetchProjectDetail(projectId);
  const [signedLog] = await attachSignedWorkLogPhotos(supabase, [
    mapWorkLog(logRow),
  ]);
  return { project, log: signedLog };
};

/**
 * Quick Log를 남기고 단수·진행률을 작품에 반영한다. 상시 메모는 덮지 않는다.
 */
const saveWorkLog = async (
  projectId: string,
  values: QuickLogValues
): Promise<{ project: Project; log: WorkLog }> => {
  const { supabase, userId } = await requireUserId();

  const { data: logRow, error: logError } = await supabase
    .from("project_logs")
    .insert({
      project_id: projectId,
      logged_on: values.loggedOn || new Date().toISOString().slice(0, 10),
      row_count: values.currentRow,
      progress_percent: values.progressPercent,
      work_minutes: values.durationMinutes,
      memo: values.memo || null,
    })
    .select("id, project_id, logged_on, row_count, progress_percent, work_minutes, photo_url, memo, created_at")
    .single();

  if (logError || !logRow) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작업 기록 저장 실패]", logError);
    }
    throw new Error("작업 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  let typedLog = logRow as ProjectLogRow;

  if (values.photo) {
    try {
      const storagePath = await uploadWorkLogPhoto(
        supabase,
        userId,
        projectId,
        typedLog.id,
        values.photo
      );

      const { data: updatedLog, error: photoError } = await supabase
        .from("project_logs")
        .update({ photo_url: storagePath })
        .eq("id", typedLog.id)
        .select(PROJECT_LOG_SELECT)
        .single();

      if (photoError || !updatedLog) {
        throw photoError ?? new Error("작업 사진을 저장하지 못했어요.");
      }

      typedLog = updatedLog as ProjectLogRow;
    } catch (photoError) {
      await supabase.from("project_logs").delete().eq("id", typedLog.id);
      if (process.env.NODE_ENV === "development") {
        console.error("[작업 기록 사진 업로드 실패]", photoError);
      }
      throw photoError instanceof Error
        ? photoError
        : new Error("작업 사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  await syncProjectProgressFromLatestLog(supabase, projectId, userId);
  return finishWorkLogMutation(supabase, projectId, typedLog);
};

/**
 * 기존 작업 기록을 수정하고, 최신 기록이면 작품 진행도 맞춘다.
 */
const updateWorkLog = async (
  projectId: string,
  logId: string,
  values: QuickLogValues
): Promise<{ project: Project; log: WorkLog }> => {
  const { supabase, userId } = await requireUserId();
  const current = await requireProjectLog(supabase, projectId, logId);

  const patch: Record<string, unknown> = {
    logged_on: values.loggedOn || current.logged_on,
    row_count: values.currentRow,
    progress_percent: values.progressPercent,
    work_minutes: values.durationMinutes,
    memo: values.memo || null,
  };

  if (values.photo) {
    try {
      patch.photo_url = await uploadWorkLogPhoto(
        supabase,
        userId,
        projectId,
        logId,
        values.photo,
        current.photo_url
      );
    } catch (photoError) {
      if (process.env.NODE_ENV === "development") {
        console.error("[작업 기록 사진 수정 실패]", photoError);
      }
      throw photoError instanceof Error
        ? photoError
        : new Error("작업 사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  const { data: updated, error } = await supabase
    .from("project_logs")
    .update(patch)
    .eq("id", logId)
    .eq("project_id", projectId)
    .select(PROJECT_LOG_SELECT)
    .single();

  if (error || !updated) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작업 기록 수정 실패]", error);
    }
    throw new Error("작업 기록을 수정하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  await syncProjectProgressFromLatestLog(supabase, projectId, userId);
  return finishWorkLogMutation(supabase, projectId, updated as ProjectLogRow);
};

/**
 * 작업 기록과 사진을 지우고, 남은 최근 기록으로 작품 진행을 맞춘다.
 */
const deleteWorkLog = async (
  projectId: string,
  logId: string
): Promise<{ project: Project }> => {
  const { supabase, userId } = await requireUserId();
  const current = await requireProjectLog(supabase, projectId, logId);

  if (current.photo_url && !current.photo_url.startsWith("http")) {
    await removeProjectCoverFromBuckets(supabase, current.photo_url);
  }

  const { error } = await supabase
    .from("project_logs")
    .delete()
    .eq("id", logId)
    .eq("project_id", projectId);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작업 기록 삭제 실패]", error);
    }
    throw new Error("작업 기록을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  await syncProjectProgressFromLatestLog(supabase, projectId, userId);
  return { project: await fetchProjectDetail(projectId) };
};

/**
 * 작품을 삭제한다.
 */
const deleteProject = async (projectId: string) => {
  const { supabase, userId } = await requireUserId();
  const current = await fetchProjectDetail(projectId);
  const yarnIds = (current.yarns ?? []).map((yarn) => yarn.yarnId);

  if (current.coverImageStoragePath) {
    await removeProjectCoverFromBuckets(supabase, current.coverImageStoragePath);
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", userId);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 삭제 실패]", error);
    }
    throw new Error("작품을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  await refreshYarnInUse(supabase, userId, yarnIds);
};

export {
  fetchProjects,
  fetchProjectDetail,
  createProject,
  updateProject,
  updateProjectStatus,
  updateProjectProgress,
  saveWorkLog,
  updateWorkLog,
  deleteWorkLog,
  deleteProject,
  resolveProjectImageUrl,
};
