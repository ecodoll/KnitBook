import KnitBookLogo from "@/components/knitbook/auth/KnitBookLogo";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 헤더 사용자 정보가 오기 전 표시할 스켈레톤이다.
 */
const AppHeaderFallback = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-3 px-4">
        <KnitBookLogo variant="inline" />
        <Skeleton className="size-8 rounded-full" aria-hidden />
        <span className="sr-only">프로필을 불러오는 중이에요…</span>
      </div>
    </header>
  );
};

export default AppHeaderFallback;
