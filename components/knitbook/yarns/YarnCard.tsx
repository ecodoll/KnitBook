import Link from "next/link";
import type { Yarn } from "@/components/knitbook/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Scissors } from "lucide-react";

type YarnCardProps = {
  yarn: Yarn;
  className?: string;
};

/**
 * 실 브랜드·색상·잔량을 카드로 표시한다.
 */
const YarnCard = ({ yarn, className }: YarnCardProps) => {
  const remaining =
    typeof yarn.remainingGrams === "number" ? `${yarn.remainingGrams}g` : null;

  return (
    <Link href={`/yarns/${yarn.id}`} className={cn("block", className)}>
      <Card size="sm" className="transition-shadow hover:shadow-sm">
        <CardHeader className="flex-row items-start gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
            {yarn.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- 외부 스토리지 URL 대응
              <img src={yarn.imageUrl} alt="" className="size-full object-cover" />
            ) : (
              <Scissors className="size-5 text-muted-foreground" aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="line-clamp-1">
              {yarn.brand} · {yarn.productName}
            </CardTitle>
            <p className="truncate text-xs text-muted-foreground">
              {[yarn.colorName, yarn.colorCode ? `#${yarn.colorCode}` : null]
                .filter(Boolean)
                .join(" · ") || "색상 미입력"}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {remaining ? <Badge variant="secondary">{remaining}</Badge> : null}
              {yarn.lotNumber ? (
                <Badge variant="outline">LOT {yarn.lotNumber}</Badge>
              ) : null}
              {yarn.isInUse ? (
                <Badge className="bg-brand-berry text-brand-berry-foreground">사용 중</Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>
        {(yarn.fiber || yarn.yarnWeight) && (
          <CardContent className="text-xs text-muted-foreground">
            {[yarn.fiber, yarn.yarnWeight].filter(Boolean).join(" · ")}
          </CardContent>
        )}
      </Card>
    </Link>
  );
};

export default YarnCard;
