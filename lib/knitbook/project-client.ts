"use client";

import type { Project, ProjectStatus, WorkLog } from "@/components/knitbook/types";
import type { QuickLogValues } from "@/components/knitbook/projects/QuickLogForm";
import type { ProjectFormValues } from "@/components/knitbook/projects/ProjectForm";
import {
  buildProjectCoverPath,
  buildProjectLogPhotoPath,
  PROJECT_DETAIL_SELECT,
  PROJECT_IMAGE_BUCKETS,
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
import { mapYarnImageUploadError } from "@/lib/knitbook/yarns/constants";
import { prepareYarnImageFile } from "@/lib/knitbook/yarns/prepare-image";
import { createClient } from "@/lib/supabase/client";

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
 * 작품 대표 사진을 올리고 DB 경로를 갱신한다.
 */
const uploadProjectCover = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
  projectId: string,
  file: File,
  previousPath?: string
) => {
  const prepared = await prepareYarnImageFile(file);
  const storagePath = buildProjectCoverPath(userId, projectId, prepared.extension);

  await uploadProjectCoverToAvailableBucket(
    supabase,
    storagePath,
    prepared.body,
    prepared.contentType
  );

  if (previousPath && previousPath !== storagePath) {
    await removeProjectCoverFromBuckets(supabase, previousPath);
  }

  const { error } = await supabase
    .from("projects")
    .update({ cover_image_url: storagePath })
    .eq("id", projectId)
    .eq("user_id", userId);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 사진 경로 저장 실패]", error);
    }
    throw new Error("작품 사진을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
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
 * 사용자의 작품 목록을 조회한다.
 */
const fetchProjects = async (): Promise<Project[]> => {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("projects")
    .select(`${PROJECT_SELECT}, patterns(id, title)`)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 목록 조회 실패]", error);
    }
    throw new Error("작품 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return attachSignedProjectCovers(
    supabase,
    ((data ?? []) as ProjectRow[]).map((row) => mapProject(row))
  );
};

/**
 * 작품 상세와 연결 실을 조회한다.
 */
const fetchProjectDetail = async (projectId: string): Promise<Project> => {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_DETAIL_SELECT)
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 상세 조회 실패]", error);
    }
    throw new Error("작품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return withSignedCover(supabase, mapProject(data as ProjectRow));
};

/**
 * 새 작품을 만들고 도안·실을 연결한다.
 */
const createProject = async (values: ProjectFormValues): Promise<Project> => {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("projects")
    .insert(toProjectWritePayload(values, userId))
    .select(PROJECT_SELECT)
    .single();

  if (error || !data) {
    if (process.env.NODE_ENV === "development") {
      console.error("[작품 생성 실패]", error);
    }
    throw new Error("작품을 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  const projectId = (data as ProjectRow).id;

  try {
    await replaceProjectYarns(supabase, projectId, userId, values.yarns);
    if (values.photo) {
      await uploadProjectCover(supabase, userId, projectId, values.photo);
    }
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

  const { error } = await supabase
    .from("projects")
    .update(toProjectWritePayload(values, userId))
    .eq("id", projectId)
    .eq("user_id", userId);

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

  if (values.photo) {
    await uploadProjectCover(
      supabase,
      userId,
      projectId,
      values.photo,
      current.coverImageStoragePath
    );
  }

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
      const prepared = await prepareYarnImageFile(values.photo);
      const storagePath = buildProjectLogPhotoPath(
        userId,
        projectId,
        typedLog.id,
        prepared.extension
      );
      await uploadProjectCoverToAvailableBucket(
        supabase,
        storagePath,
        prepared.body,
        prepared.contentType
      );

      const { data: updatedLog, error: photoError } = await supabase
        .from("project_logs")
        .update({ photo_url: storagePath })
        .eq("id", typedLog.id)
        .select("id, project_id, logged_on, row_count, progress_percent, work_minutes, photo_url, memo, created_at")
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

  const projectPatch: {
    current_row?: number | null;
    progress_percent?: number | null;
  } = {};

  if (values.currentRow !== null) {
    projectPatch.current_row = values.currentRow;
  }
  if (values.progressPercent !== null) {
    projectPatch.progress_percent = values.progressPercent;
  }

  if (Object.keys(projectPatch).length > 0) {
    const { error: projectError } = await supabase
      .from("projects")
      .update(projectPatch)
      .eq("id", projectId)
      .eq("user_id", userId);

    if (projectError) {
      if (process.env.NODE_ENV === "development") {
        console.error("[작품 진행 반영 실패]", projectError);
      }
      throw new Error("작업 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  const project = await fetchProjectDetail(projectId);
  const [signedLog] = await attachSignedWorkLogPhotos(supabase, [
    mapWorkLog(typedLog),
  ]);
  return {
    project: {
      ...project,
      currentRow: values.currentRow ?? project.currentRow,
      progressPercent: values.progressPercent ?? project.progressPercent,
      lastNote: values.memo.trim() || project.lastNote,
      lastWorkedAt: typedLog.created_at,
    },
    log: signedLog,
  };
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
  deleteProject,
};
