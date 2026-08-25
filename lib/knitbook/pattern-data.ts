import { cache } from "react";
import type { Pattern, PatternDetail } from "@/components/knitbook/types";
import { getAuthUser } from "@/lib/knitbook/app-user";
import {
  mapPattern,
  mapPatternDetail,
  type PatternPageRow,
  type PatternRow,
} from "@/lib/knitbook/patterns/map-pattern";
import { createSignedStorageUrl } from "@/lib/knitbook/patterns/signed-url";
import { createClient } from "@/lib/supabase/server";

export type PatternsPageData = {
  patterns: Pattern[];
};

export type PatternDetailPageData = {
  pattern: PatternDetail;
};

/**
 * Supabase Storage PDF 경로에 대한 서명 URL을 만든다.
 */
const createSignedPdfUrl = async (storagePath: string | null) => {
  const supabase = await createClient();
  return createSignedStorageUrl(supabase, storagePath);
};

/**
 * 도안 목록 페이지 초기 데이터를 불러온다.
 * 표지 서명은 클라이언트에서 처리해 목록 전환을 빠르게 한다.
 */
const getPatternsPageData = cache(async (): Promise<PatternsPageData | null> => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patterns")
    .select(
      "id, title, designer, cover_image_url, pdf_url, difficulty, category, tags, favorite, notes, source, last_opened_at, created_at"
    )
    .eq("user_id", authUser.id)
    .order("last_opened_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[도안 목록 조회 실패]", error.message);
    }
    throw new Error("도안 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  const rows = (data ?? []) as PatternRow[];

  return {
    patterns: rows.map((row) => mapPattern(row)),
  };
});

/**
 * 도안 상세(뷰어) 페이지 초기 데이터를 불러온다.
 */
const getPatternDetailPageData = cache(async (
  patternId: string
): Promise<PatternDetailPageData | null> => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return null;
  }

  const supabase = await createClient();
  const { data: patternRow, error: patternError } = await supabase
    .from("patterns")
    .select(
      "id, title, designer, cover_image_url, pdf_url, difficulty, category, tags, favorite, notes, source, last_opened_at, created_at"
    )
    .eq("id", patternId)
    .eq("user_id", authUser.id)
    .maybeSingle();

  if (patternError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[도안 상세 조회 실패]", patternError.message);
    }
    throw new Error("도안을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  if (!patternRow) {
    return null;
  }

  const row = patternRow as PatternRow;
  const [{ data: pageRows, error: pagesError }, signedPdfUrl, signedCoverUrl] =
    await Promise.all([
      supabase
        .from("pattern_pages")
        .select("id, page_number, bookmark, memo")
        .eq("pattern_id", patternId)
        .order("page_number", { ascending: true }),
      createSignedStorageUrl(supabase, row.pdf_url),
      createSignedStorageUrl(supabase, row.cover_image_url),
    ]);

  if (pagesError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[도안 페이지 메모 조회 실패]", pagesError.message);
    }
    throw new Error("도안 메모를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return {
    pattern: mapPatternDetail(
      row,
      (pageRows ?? []) as PatternPageRow[],
      signedPdfUrl,
      signedCoverUrl
    ),
  };
});

export { getPatternsPageData, getPatternDetailPageData, createSignedPdfUrl };
