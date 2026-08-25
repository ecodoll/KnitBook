"use client";

import type { Pattern, PatternDetail, PatternPage } from "@/components/knitbook/types";
import type { PatternUploadValues } from "@/components/knitbook/patterns/PatternUploadForm";
import {
  buildPatternCoverPath,
  buildPatternPdfPath,
  PATTERN_COVER_CONTENT_TYPE,
  PATTERN_PDF_BUCKET,
} from "@/lib/knitbook/patterns/constants";
import {
  mapPattern,
  mapPatternDetail,
  type PatternPageRow,
  type PatternRow,
} from "@/lib/knitbook/patterns/map-pattern";
import {
  createSignedStorageUrl,
} from "@/lib/knitbook/patterns/signed-url";
import { createClient } from "@/lib/supabase/client";

const PATTERN_SELECT =
  "id, title, designer, cover_image_url, pdf_url, difficulty, category, tags, favorite, notes, source, last_opened_at, created_at";

/**
 * pdf.js(표지 추출)는 브라우저 전용이라 필요할 때만 동적 로드한다.
 */
const loadExtractPatternCover = async () => {
  const { extractPatternCoverFromPdf } = await import(
    "@/lib/knitbook/patterns/extract-cover"
  );
  return extractPatternCoverFromPdf;
};

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
 * PDF Storage 경로에 대한 서명 URL을 만든다.
 */
const getSignedPdfUrl = async (storagePath: string) => {
  const supabase = createClient();
  const signedUrl = await createSignedStorageUrl(supabase, storagePath);
  if (!signedUrl) {
    throw new Error("PDF 파일 주소를 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
  return signedUrl;
};

/**
 * 사용자의 도안 목록을 조회한다.
 */
const fetchPatterns = async (): Promise<Pattern[]> => {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("patterns")
    .select(PATTERN_SELECT)
    .eq("user_id", userId)
    .order("last_opened_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as PatternRow[];
  // 목록 전환을 막지 않도록 표지 서명은 클라이언트(PatternCover)에서 처리한다.
  return rows.map((row) => mapPattern(row));
};

/**
 * 도안 상세와 페이지 메모·서명 PDF URL을 조회한다.
 */
const fetchPatternDetail = async (patternId: string): Promise<PatternDetail> => {
  const { supabase, userId } = await requireUserId();

  const { data: patternRow, error: patternError } = await supabase
    .from("patterns")
    .select(PATTERN_SELECT)
    .eq("id", patternId)
    .eq("user_id", userId)
    .maybeSingle();

  if (patternError) {
    throw patternError;
  }

  if (!patternRow) {
    throw new Error("도안을 찾을 수 없어요.");
  }

  const { data: pageRows, error: pagesError } = await supabase
    .from("pattern_pages")
    .select("id, page_number, bookmark, memo")
    .eq("pattern_id", patternId)
    .order("page_number", { ascending: true });

  if (pagesError) {
    throw pagesError;
  }

  const storagePath = (patternRow as PatternRow).pdf_url;
  const signedPdfUrl = storagePath ? await getSignedPdfUrl(storagePath) : undefined;
  const signedCoverUrl = await createSignedStorageUrl(
    supabase,
    (patternRow as PatternRow).cover_image_url
  );

  return mapPatternDetail(
    patternRow as PatternRow,
    (pageRows ?? []) as PatternPageRow[],
    signedPdfUrl,
    signedCoverUrl
  );
};

/**
 * PDF 도안을 업로드하고 DB에 저장한다.
 */
const uploadPattern = async (values: PatternUploadValues): Promise<Pattern> => {
  if (!values.file) {
    throw new Error("PDF 파일을 선택해 주세요.");
  }

  const { supabase, userId } = await requireUserId();

  const { data: inserted, error: insertError } = await supabase
    .from("patterns")
    .insert({
      user_id: userId,
      title: values.title,
      designer: values.designer || null,
      notes: values.memo || null,
    })
    .select(PATTERN_SELECT)
    .single();

  if (insertError || !inserted) {
    throw insertError ?? new Error("도안 정보를 저장하지 못했어요.");
  }

  const patternId = (inserted as PatternRow).id;
  const storagePath = buildPatternPdfPath(userId, patternId);
  const coverPath = buildPatternCoverPath(userId, patternId);
  const extractPatternCoverFromPdf = await loadExtractPatternCover();
  const coverPromise = extractPatternCoverFromPdf(values.file);

  const { error: uploadError } = await supabase.storage
    .from(PATTERN_PDF_BUCKET)
    .upload(storagePath, values.file, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    await supabase.from("patterns").delete().eq("id", patternId);
    throw uploadError;
  }

  let coverStoragePath: string | null = null;
  try {
    const coverBlob = await coverPromise;
    if (coverBlob) {
      const { error: coverError } = await supabase.storage
        .from(PATTERN_PDF_BUCKET)
        .upload(coverPath, coverBlob, {
          contentType: PATTERN_COVER_CONTENT_TYPE,
          upsert: true,
        });

      if (coverError) {
        if (process.env.NODE_ENV === "development") {
          console.error("[도안 표지 업로드 실패]", coverError.message);
        }
      } else {
        coverStoragePath = coverPath;
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[도안 표지 추출 실패]", error);
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("patterns")
    .update({
      pdf_url: storagePath,
      cover_image_url: coverStoragePath,
    })
    .eq("id", patternId)
    .select(PATTERN_SELECT)
    .single();

  if (updateError || !updated) {
    throw updateError ?? new Error("도안 PDF 경로를 저장하지 못했어요.");
  }

  const signedCoverUrl = await createSignedStorageUrl(
    supabase,
    (updated as PatternRow).cover_image_url
  );

  return mapPattern(updated as PatternRow, { signedCoverUrl });
};

/**
 * 도안 최근 열람 시각을 갱신한다.
 */
const touchPatternOpened = async (patternId: string) => {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase
    .from("patterns")
    .update({ last_opened_at: new Date().toISOString() })
    .eq("id", patternId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
};

/**
 * 현재 페이지의 북마크·메모를 저장한다.
 */
const upsertPatternPage = async (
  patternId: string,
  pageNumber: number,
  patch: { bookmark?: boolean; memo?: string }
): Promise<PatternPage> => {
  const { supabase } = await requireUserId();

  const { data: existing } = await supabase
    .from("pattern_pages")
    .select("id, page_number, bookmark, memo")
    .eq("pattern_id", patternId)
    .eq("page_number", pageNumber)
    .maybeSingle();

  const existingRow = (existing as PatternPageRow | null) ?? null;

  const { data, error } = await supabase
    .from("pattern_pages")
    .upsert(
      {
        pattern_id: patternId,
        page_number: pageNumber,
        bookmark: patch.bookmark ?? existingRow?.bookmark ?? false,
        memo:
          patch.memo !== undefined
            ? patch.memo || null
            : existingRow?.memo ?? null,
      },
      { onConflict: "pattern_id,page_number" }
    )
    .select("id, page_number, bookmark, memo")
    .single();

  if (error || !data) {
    throw error ?? new Error("페이지 메모를 저장하지 못했어요.");
  }

  const row = data as PatternPageRow;
  return {
    id: row.id,
    pageNumber: row.page_number,
    bookmark: row.bookmark,
    memo: row.memo ?? undefined,
  };
};

/**
 * 도안을 삭제한다. (Storage PDF·표지 포함)
 */
const deletePattern = async (patternId: string, storagePath?: string) => {
  const { supabase, userId } = await requireUserId();
  const pathsToRemove = [
    storagePath,
    buildPatternCoverPath(userId, patternId),
  ].filter((path): path is string => Boolean(path));

  if (pathsToRemove.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(PATTERN_PDF_BUCKET)
      .remove(pathsToRemove);

    if (storageError && process.env.NODE_ENV === "development") {
      console.error("[PDF 삭제 실패]", storageError.message);
    }
  }

  const { error } = await supabase
    .from("patterns")
    .delete()
    .eq("id", patternId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
};

/**
 * 선택한 도안으로 새 작품을 만든다.
 */
const createProjectFromPattern = async (
  patternId: string,
  title: string
): Promise<{ id: string; title: string }> => {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      pattern_id: patternId,
      title: title.trim(),
      status: "planned",
      progress_percent: 0,
    })
    .select("id, title")
    .single();

  if (error || !data) {
    throw error ?? new Error("작품을 만들지 못했어요.");
  }

  return data;
};

const coverJobs = new Map<string, Promise<string | undefined>>();
let activeCoverJobs = 0;
const waitingCoverJobs: Array<() => void> = [];
const MAX_COVER_JOBS = 2;

/**
 * 동시에 돌아가는 표지 추출 작업 수를 제한한다.
 */
const withCoverJobLimit = async <T>(task: () => Promise<T>) => {
  if (activeCoverJobs >= MAX_COVER_JOBS) {
    await new Promise<void>((resolve) => {
      waitingCoverJobs.push(resolve);
    });
  }

  activeCoverJobs += 1;
  try {
    return await task();
  } finally {
    activeCoverJobs -= 1;
    waitingCoverJobs.shift()?.();
  }
};

/**
 * 표지가 없으면 PDF 첫 페이지에서 만들어 저장한다.
 */
const ensurePatternCover = async (
  patternId: string,
  pdfStoragePath: string
): Promise<string | undefined> => {
  const pending = coverJobs.get(patternId);
  if (pending) {
    return pending;
  }

  const job = withCoverJobLimit(async () => {
    const { supabase, userId } = await requireUserId();
    const { data: existing, error: existingError } = await supabase
      .from("patterns")
      .select("cover_image_url")
      .eq("id", patternId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    const existingCover = (existing as { cover_image_url: string | null } | null)
      ?.cover_image_url;
    if (existingCover) {
      return createSignedStorageUrl(supabase, existingCover);
    }

    const signedPdfUrl = await getSignedPdfUrl(pdfStoragePath);
    const extractPatternCoverFromPdf = await loadExtractPatternCover();
    const coverBlob = await extractPatternCoverFromPdf(signedPdfUrl);
    if (!coverBlob) {
      return undefined;
    }

    const coverPath = buildPatternCoverPath(userId, patternId);
    const { error: coverError } = await supabase.storage
      .from(PATTERN_PDF_BUCKET)
      .upload(coverPath, coverBlob, {
        contentType: PATTERN_COVER_CONTENT_TYPE,
        upsert: true,
      });

    if (coverError) {
      throw coverError;
    }

    const { error: updateError } = await supabase
      .from("patterns")
      .update({ cover_image_url: coverPath })
      .eq("id", patternId)
      .eq("user_id", userId);

    if (updateError) {
      throw updateError;
    }

    return createSignedStorageUrl(supabase, coverPath);
  }).finally(() => {
    coverJobs.delete(patternId);
  });

  coverJobs.set(patternId, job);
  return job;
};

/**
 * 표지 Storage 경로를 표시용 서명 URL로 만든다.
 */
const resolvePatternCoverUrl = async (coverStoragePath: string) => {
  const supabase = createClient();
  return createSignedStorageUrl(supabase, coverStoragePath);
};

export {
  fetchPatterns,
  fetchPatternDetail,
  uploadPattern,
  touchPatternOpened,
  upsertPatternPage,
  deletePattern,
  createProjectFromPattern,
  getSignedPdfUrl,
  ensurePatternCover,
  resolvePatternCoverUrl,
};
