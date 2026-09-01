/**
 * KnitBook MVP 도메인에서 공통으로 쓰는 타입 정의.
 */

/** 작품 진행 상태 */
export type ProjectStatus = "planned" | "in_progress" | "paused" | "completed";

/** 도안 난이도 (1~5) */
export type PatternDifficulty = 1 | 2 | 3 | 4 | 5;

/** 도안 요약 정보 */
export type Pattern = {
  id: string;
  title: string;
  designer?: string;
  /** 표시용 표지 URL (공개 URL 또는 서명 URL) */
  coverImageUrl?: string;
  /** Storage에 저장된 표지 경로. 클라이언트에서 서명해 표시한다. */
  coverStoragePath?: string;
  /** Storage에 저장된 PDF 경로. 표지가 없을 때 첫 페이지에서 추출한다. */
  pdfStoragePath?: string;
  difficulty?: PatternDifficulty;
  category?: string;
  tags?: string[];
  isFavorite?: boolean;
  lastOpenedAt?: string;
  createdAt: string;
};

/** 도안 페이지별 북마크·메모 */
export type PatternPage = {
  id?: string;
  pageNumber: number;
  bookmark: boolean;
  memo?: string;
};

/** 도안 상세(뷰어) 정보 */
export type PatternDetail = Pattern & {
  pdfUrl?: string;
  pdfStoragePath?: string;
  notes?: string;
  source?: string;
  pages: PatternPage[];
};

/** 작품(프로젝트) 요약 정보 */
export type Project = {
  id: string;
  title: string;
  status: ProjectStatus;
  coverImageUrl?: string;
  progressPercent: number;
  currentRow?: number;
  totalRows?: number;
  lastWorkedAt?: string;
  lastNote?: string;
  patternId?: string;
  patternTitle?: string;
  size?: string;
  startedAt?: string;
  targetDate?: string;
  completedAt?: string;
  notes?: string;
  yarns?: ProjectYarnLink[];
};

/** 작품에 연결한 실 */
export type ProjectYarnLink = {
  id: string;
  yarnId: string;
  brand: string;
  productName: string;
  colorName?: string;
  plannedQuantity?: number;
  usedQuantity?: number;
  remainingGrams?: number;
};

/** 작품 작업 기록(Quick Log) */
export type WorkLog = {
  id: string;
  projectId: string;
  date: string;
  currentRow?: number;
  progressPercent?: number;
  durationMinutes?: number;
  memo?: string;
  photoUrl?: string;
};

/** 실 재고 정보 */
export type Yarn = {
  id: string;
  brand: string;
  productName: string;
  productCode?: string;
  colorName?: string;
  weightGrams?: number;
  remainingGrams?: number;
  notes?: string;
  /** 표시용 사진 URL (공개 URL 또는 서명 URL) */
  imageUrl?: string;
  /** Storage에 저장된 사진 경로. 클라이언트에서 서명해 표시한다. */
  imageStoragePath?: string;
  isInUse?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/** 실 재고 요약(홈 대시보드용) */
export type YarnInventorySummary = {
  totalKinds: number;
  totalRemainingGrams?: number;
  lowStockCount: number;
  recentYarns: Yarn[];
};
