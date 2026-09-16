import Image from "next/image";
import { cn } from "@/lib/utils";
import type { GuideFigureData } from "@/lib/knitbook/guide-images";

type GuideFigureProps = {
  figure: GuideFigureData;
  /** 히어로는 먼저 불러 레이아웃이 밀리지 않게 한다 */
  priority?: boolean;
  className?: string;
};

/**
 * 가이드 글의 사진과 짧은 설명을 보여 준다.
 */
const GuideFigure = ({ figure, priority = false, className }: GuideFigureProps) => {
  return (
    <figure className={cn("space-y-2", className)}>
      <div
        className="relative overflow-hidden rounded-xl border border-border bg-muted"
        style={{ aspectRatio: `${figure.width} / ${figure.height}` }}
      >
        <Image
          src={figure.src}
          alt={figure.alt}
          fill
          sizes="(max-width: 768px) 100vw, 48rem"
          priority={priority}
          className="object-cover"
        />
      </div>
      <figcaption className="text-xs leading-5 text-muted-foreground">
        {figure.caption}
      </figcaption>
    </figure>
  );
};

export default GuideFigure;
