import Link from "next/link";
import type { Yarn } from "@/components/knitbook/types";
import YarnPhoto from "@/components/knitbook/yarns/YarnPhoto";
import { cn } from "@/lib/utils";

type YarnCardProps = {
  yarn: Yarn;
  className?: string;
};

/**
 * 실 사진을 정사각 격자의 한 칸으로 표시한다.
 */
const YarnCard = ({ yarn, className }: YarnCardProps) => {
  const remaining =
    typeof yarn.remainingGrams === "number" ? `${yarn.remainingGrams}g` : null;
  const subtitle = [yarn.brand, yarn.colorName].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/yarns/${yarn.id}`}
      className={cn(
        "group relative block aspect-square w-full overflow-hidden bg-muted outline-none focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/60",
        className
      )}
      aria-label={`${yarn.productName}${subtitle ? ` · ${subtitle}` : ""}${remaining ? ` · 남은 ${remaining}` : ""}`}
    >
      <YarnPhoto yarn={yarn} large className="size-full rounded-none" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1.5 text-left">
        <span className="line-clamp-1 text-[11px] font-medium text-white">
          {yarn.productName}
        </span>
        {remaining || subtitle ? (
          <span className="line-clamp-1 text-[10px] text-white/80">
            {[subtitle, remaining].filter(Boolean).join(" · ")}
          </span>
        ) : null}
      </span>
    </Link>
  );
};

export default YarnCard;
