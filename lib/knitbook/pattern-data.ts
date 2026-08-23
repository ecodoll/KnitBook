import type { Pattern, PatternDetail } from "@/components/knitbook/types";
import type { AppHeaderUser } from "@/components/knitbook/layout/AppHeader";
import { getAppHeaderUser } from "@/lib/knitbook/app-user";
import {
  mapPattern,
  mapPatternDetail,
  type PatternPageRow,
  type PatternRow,
} from "@/lib/knitbook/patterns/map-pattern";
import {
  PATTERN_PDF_BUCKET,
  PATTERN_SIGNED_URL_TTL,
} from "@/lib/knitbook/patterns/constants";
import { createClient } from "@/lib/supabase/server";

export type PatternsPageData = {
  user: AppHeaderUser;
  patterns: Pattern[];
};

export type PatternDetailPageData = {
  user: AppHeaderUser;
  pattern: PatternDetail;
};

/**
 * Supabase Storage PDF 경로에 대한 서명 URL을 만든다.
 */
const createSignedPdfUrl = async (storagePath: string | null) => {
  if (!storagePath) {
    return undefined;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(PATTERN_PDF_BUCKET)
    .createSignedUrl(storagePath, PATTERN_SIGNED_URL_TTL);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[PDF 서명 URL 생성 실패]", error.message);
    }
    return undefined;
  }

  return data.signedUrl;
};

/**
 * 도안 목록 페이지 초기 데이터를 불러온다.
 */
const getPatternsPageData = async (): Promise<PatternsPageData | null> => {
  const user = await getAppHeaderUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

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

  return {
    user,
    patterns: ((data ?? []) as PatternRow[]).map(mapPattern),
  };
};

/**
 * 도안 상세(뷰어) 페이지 초기 데이터를 불러온다.
 */
const getPatternDetailPageData = async (
  patternId: string
): Promise<PatternDetailPageData | null> => {
  const user = await getAppHeaderUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

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

  const { data: pageRows, error: pagesError } = await supabase
    .from("pattern_pages")
    .select("id, page_number, bookmark, memo")
    .eq("pattern_id", patternId)
    .order("page_number", { ascending: true });

  if (pagesError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[도안 페이지 메모 조회 실패]", pagesError.message);
    }
    throw new Error("도안 메모를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  const signedPdfUrl = await createSignedPdfUrl(
    (patternRow as PatternRow).pdf_url
  );

  return {
    user,
    pattern: mapPatternDetail(
      patternRow as PatternRow,
      (pageRows ?? []) as PatternPageRow[],
      signedPdfUrl
    ),
  };
};

export { getPatternsPageData, getPatternDetailPageData, createSignedPdfUrl };
