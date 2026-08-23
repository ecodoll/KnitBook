"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Pattern } from "@/components/knitbook/types";
import PatternList from "@/components/knitbook/patterns/PatternList";
import { fetchPatterns } from "@/lib/knitbook/pattern-client";
import { showNetworkErrorToast } from "@/lib/knitbook/use-knitbook-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type PatternsScreenProps = {
  initialPatterns: Pattern[];
};

/**
 * 도안 목록·검색·새로고침 화면을 구성한다.
 */
const PatternsScreen = ({ initialPatterns }: PatternsScreenProps) => {
  const [patterns, setPatterns] = useState(initialPatterns);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setPatterns(initialPatterns);
  }, [initialPatterns]);

  const reloadPatterns = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const next = await fetchPatterns();
      setPatterns(next);
    } catch (error) {
      const message = "도안 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";
      setErrorMessage(message);
      showNetworkErrorToast(error, message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredPatterns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return patterns;
    }

    return patterns.filter((pattern) => {
      const haystack = [
        pattern.title,
        pattern.designer,
        ...(pattern.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [patterns, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">도안</h1>
          <p className="text-sm text-muted-foreground">
            PDF 도안을 업로드하고 한곳에서 관리해요.
          </p>
        </div>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/patterns/new" />}
        >
          <Plus data-icon="inline-start" />
          올리기
        </Button>
      </div>

      <PatternList
        patterns={filteredPatterns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onRetry={() => void reloadPatterns()}
      />
    </div>
  );
};

export default PatternsScreen;
