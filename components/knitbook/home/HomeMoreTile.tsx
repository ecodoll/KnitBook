import Link from "next/link";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

type HomeMoreTileProps = {
  href?: string;
  label?: string;
  className?: string;
};

/**
 * 홈 작품 줄 끝의 … 타일로 작품 목록으로 보낸다.
 */
const HomeMoreTile = ({
  href = "/projects",
  label = "더 보기",
  className,
}: HomeMoreTileProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "group block outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-xl",
        className
      )}
      aria-label="작품 목록"
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-secondary ring-1 ring-foreground/10 transition-shadow group-hover:shadow-sm">
        <MoreHorizontal className="size-7 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-4 truncate text-center text-xs font-medium text-muted-foreground">
        {label}
      </p>
    </Link>
  );
};

export default HomeMoreTile;
