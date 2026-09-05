"use client";

import type { Yarn } from "@/components/knitbook/types";
import StorageImage from "@/components/knitbook/shared/StorageImage";
import { cn } from "@/lib/utils";
import { resolveYarnImageUrl } from "@/lib/knitbook/yarn-client";
import { Scissors } from "lucide-react";

type YarnPhotoProps = {
  yarn: Pick<Yarn, "productName" | "imageUrl" | "imageStoragePath">;
  className?: string;
  /** 정사각 썸네일 대신 큰 사진을 보여 줄지 여부 */
  large?: boolean;
};

/**
 * 실 사진을 보여 주고, Storage 경로는 클라이언트에서 서명한다.
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
      <StorageImage
        src={yarn.imageUrl}
        storagePath={yarn.imageStoragePath}
        resolveUrl={resolveYarnImageUrl}
        alt={`${yarn.productName} 사진`}
        className="size-full object-cover"
        fallback={
          <Scissors
            className={cn(
              "text-muted-foreground",
              large ? "size-10" : "size-5"
            )}
            aria-hidden
          />
        }
      />
    </div>
  );
};

export default YarnPhoto;
