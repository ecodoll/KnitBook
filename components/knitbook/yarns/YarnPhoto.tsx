import type { Yarn } from "@/components/knitbook/types";
import { cn } from "@/lib/utils";
import { Scissors } from "lucide-react";

type YarnPhotoProps = {
  yarn: Pick<Yarn, "productName" | "imageUrl">;
  className?: string;
  /** 정사각 썸네일 대신 큰 사진을 보여 줄지 여부 */
  large?: boolean;
};

/**
 * 실 사진을 보여 주고, 없으면 아이콘 자리 표시를 한다.
 */
const YarnPhoto = ({ yarn, className, large = false }: YarnPhotoProps) => {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-secondary",
        large ? "aspect-square w-full rounded-lg" : "size-14 rounded-lg",
        className
      )}
    >
      {yarn.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- 스토리지 서명 URL 대응
        <img
          src={yarn.imageUrl}
          alt={`${yarn.productName} 사진`}
          className="size-full object-cover"
        />
      ) : (
        <Scissors
          className={cn(
            "text-muted-foreground",
            large ? "size-10" : "size-5"
          )}
          aria-hidden
        />
      )}
    </div>
  );
};

export default YarnPhoto;
