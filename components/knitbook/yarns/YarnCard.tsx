import Link from "next/link";
import type { Yarn } from "@/components/knitbook/types";
import YarnPhoto from "@/components/knitbook/yarns/YarnPhoto";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type YarnCardProps = {
  yarn: Yarn;
  className?: string;
};

/**
 * 실 이름·브랜드·색깔·남은 무게를 카드로 표시한다.
 */
const YarnCard = ({ yarn, className }: YarnCardProps) => {
  const remaining =
    typeof yarn.remainingGrams === "number" ? `${yarn.remainingGrams}g` : null;

  return (
    <Link href={`/yarns/${yarn.id}`} className={cn("block", className)}>
      <Card size="sm" className="transition-shadow hover:shadow-sm">
        <CardHeader className="flex-row items-start gap-3">
          <YarnPhoto yarn={yarn} />
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="line-clamp-1">
              {yarn.productName}
            </CardTitle>
            <p className="truncate text-xs text-muted-foreground">
              {[yarn.brand, yarn.colorName].filter(Boolean).join(" · ") || "정보 미입력"}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {remaining ? <Badge variant="secondary">남은 {remaining}</Badge> : null}
              {yarn.productCode ? (
                <Badge variant="outline">{yarn.productCode}</Badge>
              ) : null}
              {yarn.isInUse ? (
                <Badge className="bg-brand-berry text-brand-berry-foreground">사용 중</Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default YarnCard;
