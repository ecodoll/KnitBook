import type {
  Pattern,
  PatternDetail,
  PatternDifficulty,
  PatternPage,
} from "@/components/knitbook/types";

type PatternRow = {
  id: string;
  title: string;
  designer: string | null;
  cover_image_url: string | null;
  pdf_url: string | null;
  difficulty: number | null;
  category: string | null;
  tags: string[] | null;
  favorite: boolean | null;
  notes: string | null;
  source: string | null;
  last_opened_at: string | null;
  created_at: string;
};

type PatternPageRow = {
  id: string;
  page_number: number;
  bookmark: boolean;
  memo: string | null;
};

type MapPatternOptions = {
  /** 표시용으로 서명한 표지 URL */
  signedCoverUrl?: string;
};

/**
 * DB 도안 행을 UI Pattern 타입으로 변환한다.
 */
const mapPattern = (row: PatternRow, options?: MapPatternOptions): Pattern => {
  const difficulty =
    row.difficulty === 1 ||
    row.difficulty === 2 ||
    row.difficulty === 3 ||
    row.difficulty === 4 ||
    row.difficulty === 5
      ? (row.difficulty as PatternDifficulty)
      : undefined;

  return {
    id: row.id,
    title: row.title,
    designer: row.designer ?? undefined,
    coverImageUrl: options?.signedCoverUrl,
    pdfStoragePath: row.pdf_url ?? undefined,
    difficulty,
    category: row.category ?? undefined,
    tags: row.tags ?? undefined,
    isFavorite: row.favorite ?? false,
    lastOpenedAt: row.last_opened_at ?? undefined,
    createdAt: row.created_at,
  };
};

/**
 * DB 페이지 행을 UI PatternPage 타입으로 변환한다.
 */
const mapPatternPage = (row: PatternPageRow): PatternPage => {
  return {
    id: row.id,
    pageNumber: row.page_number,
    bookmark: row.bookmark,
    memo: row.memo ?? undefined,
  };
};

/**
 * DB 도안·페이지 행을 UI PatternDetail 타입으로 변환한다.
 */
const mapPatternDetail = (
  row: PatternRow,
  pages: PatternPageRow[],
  signedPdfUrl?: string,
  signedCoverUrl?: string
): PatternDetail => {
  return {
    ...mapPattern(row, { signedCoverUrl }),
    pdfStoragePath: row.pdf_url ?? undefined,
    pdfUrl: signedPdfUrl,
    notes: row.notes ?? undefined,
    source: row.source ?? undefined,
    pages: pages.map(mapPatternPage),
  };
};

export type { PatternRow, PatternPageRow };
export { mapPattern, mapPatternPage, mapPatternDetail };
