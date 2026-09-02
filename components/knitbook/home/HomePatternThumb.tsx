import Link from "next/link";
import type { Pattern } from "@/components/knitbook/types";
import PatternCover from "@/components/knitbook/patterns/PatternCover";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

type HomePatternThumbProps = {
  pattern: Pattern;
  className?: string;
};

/**
 * 홈용 작은 도안 썸네일과 한 줄 제목을 표시한다.
 */
const HomePatternThumb = ({ pattern, className }: HomePatternThumbProps) => {
  return (
    <Link
      href={`/patterns/${pattern.id}`}
      className={cn(
        "group block outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-lg",
        className
      )}
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-secondary ring-1 ring-foreground/10 transition-shadow group-hover:shadow-sm">
        <PatternCover
          patternId={pattern.id}
          title={pattern.title}
          coverImageUrl={pattern.coverImageUrl}
          coverStoragePath={pattern.coverStoragePath}
          pdfStoragePath={pattern.pdfStoragePath}
          compact
        />
        {pattern.isFavorite ? (
          <span className="absolute top-1 right-1 rounded-full bg-card/90 p-0.5 text-brand-berry">
            <Heart className="size-2.5 fill-current" aria-label="즐겨찾기" />
          </span>
        ) : null}
      </div>
      <p className="mt-1 truncate text-center text-xs font-medium text-foreground">
        {pattern.title}
      </p>
    </Link>
  );
};

export default HomePatternThumb;
