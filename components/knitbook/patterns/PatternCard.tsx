import Link from "next/link";
import type { Pattern } from "@/components/knitbook/types";
import PatternCover from "@/components/knitbook/patterns/PatternCover";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

type PatternCardProps = {
  pattern: Pattern;
  className?: string;
};

/**
 * 도안 표지를 정사각 격자의 한 칸으로 표시한다.
 */
const PatternCard = ({ pattern, className }: PatternCardProps) => {
  const subtitle = pattern.designer ?? null;

  return (
    <Link
      href={`/patterns/${pattern.id}`}
      className={cn(
        "group relative block aspect-square w-full overflow-hidden bg-muted outline-none focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/60",
        className
      )}
      aria-label={`${pattern.title}${subtitle ? ` · ${subtitle}` : ""}`}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-secondary">
        <PatternCover
          patternId={pattern.id}
          title={pattern.title}
          coverImageUrl={pattern.coverImageUrl}
          coverStoragePath={pattern.coverStoragePath}
          pdfStoragePath={pattern.pdfStoragePath}
          compact
        />
      </div>
      {pattern.isFavorite ? (
        <span className="absolute top-1.5 right-1.5 rounded-full bg-black/45 p-1 text-white">
          <Heart className="size-3 fill-current" aria-hidden />
        </span>
      ) : null}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1.5 text-left">
        <span className="line-clamp-1 text-[11px] font-medium text-white">
          {pattern.title}
        </span>
        {subtitle ? (
          <span className="line-clamp-1 text-[10px] text-white/80">
            {subtitle}
          </span>
        ) : null}
      </span>
    </Link>
  );
};

export default PatternCard;
