"use client";

import type { Pattern, PatternDetail, PatternPage } from "@/components/knitbook/types";
import type { PatternUploadValues } from "@/components/knitbook/patterns/PatternUploadForm";
import {
  buildPatternPdfPath,
  PATTERN_PDF_BUCKET,
  PATTERN_SIGNED_URL_TTL,
} from "@/lib/knitbook/patterns/constants";
import {
  mapPattern,
  mapPatternDetail,
  type PatternPageRow,
  type PatternRow,
} from "@/lib/knitbook/patterns/map-pattern";
import { createClient } from "@/lib/supabase/client";

const PATTERN_SELECT =
  "id, title, designer, cover_image_url, pdf_url, difficulty, category, tags, favorite, notes, source, last_opened_at, created_at";

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
  const { data, error } = await supabase.storage
    .from(PATTERN_PDF_BUCKET)
    .createSignedUrl(storagePath, PATTERN_SIGNED_URL_TTL);

  if (error) {
    throw new Error("PDF 파일 주소를 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return data.signedUrl;
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

  return ((data ?? []) as PatternRow[]).map(mapPattern);
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

  return mapPatternDetail(
    patternRow as PatternRow,
    (pageRows ?? []) as PatternPageRow[],
    signedPdfUrl
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

  const { data: updated, error: updateError } = await supabase
    .from("patterns")
    .update({ pdf_url: storagePath })
    .eq("id", patternId)
    .select(PATTERN_SELECT)
    .single();

  if (updateError || !updated) {
    throw updateError ?? new Error("도안 PDF 경로를 저장하지 못했어요.");
  }

  return mapPattern(updated as PatternRow);
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
 * 도안을 삭제한다. (Storage PDF 포함)
 */
const deletePattern = async (patternId: string, storagePath?: string) => {
  const { supabase, userId } = await requireUserId();

  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from(PATTERN_PDF_BUCKET)
      .remove([storagePath]);

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

export {
  fetchPatterns,
  fetchPatternDetail,
  uploadPattern,
  touchPatternOpened,
  upsertPatternPage,
  deletePattern,
  createProjectFromPattern,
  getSignedPdfUrl,
};
