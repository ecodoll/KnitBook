import type { Yarn, YarnInventorySummary } from "@/components/knitbook/types";
import { HOME_YARN_THUMB_LIMIT } from "@/components/knitbook/home/constants";
import { LOW_STOCK_GRAMS } from "@/lib/knitbook/yarns/constants";

/**
 * 실 목록에서 홈·요약에 쓰는 재고 요약을 만든다.
 */
const buildYarnInventorySummary = (yarns: Yarn[]): YarnInventorySummary => {
  const recentYarns = yarns.slice(0, HOME_YARN_THUMB_LIMIT);
  const totalRemainingGrams = yarns.reduce((sum, yarn) => {
    return sum + (yarn.remainingGrams ?? 0);
  }, 0);
  const lowStockCount = yarns.filter((yarn) => {
    return (
      typeof yarn.remainingGrams === "number" &&
      yarn.remainingGrams < LOW_STOCK_GRAMS
    );
  }).length;

  return {
    totalKinds: yarns.length,
    totalRemainingGrams: yarns.length > 0 ? totalRemainingGrams : undefined,
    lowStockCount,
    recentYarns,
  };
};

export { buildYarnInventorySummary };
