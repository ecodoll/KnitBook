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
  coverImageUrl?: string;
  difficulty?: PatternDifficulty;
  category?: string;
  tags?: string[];
  isFavorite?: boolean;
  lastOpenedAt?: string;
  createdAt: string;
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

/** 실 재고 요약 정보 */
export type Yarn = {
  id: string;
  brand: string;
  productName: string;
  colorName?: string;
  colorCode?: string;
  lotNumber?: string;
  fiber?: string;
  weightGrams?: number;
  remainingGrams?: number;
  quantity?: number;
  yarnWeight?: string;
  needleSizeMm?: string;
  imageUrl?: string;
  isInUse?: boolean;
};

/** 실 재고 요약(홈 대시보드용) */
export type YarnInventorySummary = {
  totalKinds: number;
  totalRemainingGrams?: number;
  lowStockCount: number;
  recentYarns: Yarn[];
};
