import type { Project } from "@/components/knitbook/types";

/** 홈에서 한 줄에 보여주는 진행 작품 최대 개수 */
export const HOME_PROJECT_VISIBLE_LIMIT = 3;

/**
 * 최근 작업 시각이 늦은 작품이 앞에 오도록 정렬한다.
 */
export const sortProjectsByLatestWork = (projects: Project[]) => {
  return [...projects].sort((left, right) => {
    const leftTime = Date.parse(left.lastWorkedAt ?? "") || 0;
    const rightTime = Date.parse(right.lastWorkedAt ?? "") || 0;
    return rightTime - leftTime;
  });
};

/** 홈 도안 썸네일 최대 개수 (작은 화면은 4개, 390px 이상은 5개) */
export const HOME_PATTERN_VISIBLE_LIMIT = 5;

/** 홈 실 아이콘 최대 개수 */
export const HOME_YARN_THUMB_LIMIT = 4;
