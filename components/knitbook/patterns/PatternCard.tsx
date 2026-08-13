import Link from "next/link";
import type { Pattern } from "@/components/knitbook/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Heart, BookOpen } from "lucide-react";

type PatternCardProps = {
  pattern: Pattern;
  /** 홈 등 좁은 그리드용 */
  compact?: boolean;
  className?: string;
};

/**
 * 도안 썸네일·제목·난이도를 카드로 표시한다.
 */
const PatternCard = ({ pattern, compact = false, className }: PatternCardProps) => {
  return (
    <Link
      href={`/patterns/${pattern.id}`}
      className={cn(
        "group block overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center bg-secondary",
          compact ? "aspect-[3/4]" : "aspect-[4/3]"
        )}
      >
        {pattern.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- 외부 스토리지 URL 대응
          <img
            src={pattern.coverImageUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <BookOpen className="size-8 text-muted-foreground" aria-hidden />
        )}
        {pattern.isFavorite ? (
          <span className="absolute top-2 right-2 rounded-full bg-card/90 p-1 text-brand-berry">
            <Heart className="size-3.5 fill-current" aria-label="즐겨찾기" />
          </span>
        ) : null}
      </div>
      <div className={cn("space-y-1 p-3", compact && "p-2.5")}>
        <p className="line-clamp-2 text-sm font-medium text-foreground">
          {pattern.title}
        </p>
        {!compact && pattern.designer ? (
          <p className="truncate text-xs text-muted-foreground">{pattern.designer}</p>
        ) : null}
        {pattern.difficulty ? (
          <Badge variant="secondary" className="mt-1">
            난이도 {"★".repeat(pattern.difficulty)}
            {"☆".repeat(5 - pattern.difficulty)}
          </Badge>
        ) : null}
      </div>
    </Link>
  );
};

export default PatternCard;
