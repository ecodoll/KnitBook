"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import type { Yarn } from "@/components/knitbook/types";
import YarnList, {
  type YarnFilterKey,
} from "@/components/knitbook/yarns/YarnList";
import { LOW_STOCK_GRAMS } from "@/lib/knitbook/yarns/constants";
import { fetchYarns } from "@/lib/knitbook/yarn-client";
import { showNetworkErrorToast } from "@/lib/knitbook/use-knitbook-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type YarnsScreenProps = {
  initialYarns: Yarn[];
};

/**
 * 검색·필터 조건에 맞는 실인지 판별한다.
 */
const matchesYarnFilter = (
  yarn: Yarn,
  query: string,
  activeFilter: YarnFilterKey
) => {
  if (activeFilter === "in_use" && !yarn.isInUse) {
    return false;
  }

  if (activeFilter === "low_stock") {
    const isLow =
      typeof yarn.remainingGrams === "number"
        ? yarn.remainingGrams < LOW_STOCK_GRAMS
        : (yarn.quantity ?? 0) <= 0;
    if (!isLow) {
      return false;
    }
  }

  if (!query) {
    return true;
  }

  const haystack = [
    yarn.brand,
    yarn.productName,
    yarn.productCode,
    yarn.colorName,
    yarn.colorCode,
    yarn.lotNumber,
    yarn.fiber,
    yarn.yarnWeight,
    yarn.needleSizeMm,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
};

/**
 * 실 재고 목록·검색·필터 화면을 구성한다.
 */
const YarnsScreen = ({ initialYarns }: YarnsScreenProps) => {
  const [yarns, setYarns] = useState(initialYarns);
  const [yarnsSource, setYarnsSource] = useState(initialYarns);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<YarnFilterKey>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (initialYarns !== yarnsSource) {
    setYarnsSource(initialYarns);
    setYarns(initialYarns);
  }

  const reloadYarns = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const next = await fetchYarns();
      setYarns(next);
    } catch (error) {
      const message = "실 재고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";
      setErrorMessage(message);
      showNetworkErrorToast(error, message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredYarns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return yarns.filter((yarn) => matchesYarnFilter(yarn, query, activeFilter));
  }, [yarns, searchQuery, activeFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">실</h1>
          <p className="text-sm text-muted-foreground">
            보유한 실의 종류와 남은 양을 한곳에서 관리해요.
          </p>
        </div>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/yarns/new" />}
        >
          <Plus data-icon="inline-start" />
          등록
        </Button>
      </div>

      <YarnList
        yarns={filteredYarns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onRetry={() => void reloadYarns()}
      />
    </div>
  );
};

export default YarnsScreen;
