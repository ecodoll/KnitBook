import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";

/**
 * 홈 하단의 짧은 AI 추천 예고 배너를 표시한다.
 */
const HomeAiTeaser = () => {
  return (
    <Link
      href="/ai"
      className="flex items-center gap-2.5 rounded-xl border border-dashed border-border bg-card/70 px-3 py-2.5 outline-none transition-shadow hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Sparkles className="size-4" aria-hidden />
      </span>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        AI 추천 곧 만나요
      </p>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
};

export default HomeAiTeaser;
