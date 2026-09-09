"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type AdUnitProps = {
  clientId: string;
  slotId: string;
  format?: "auto" | "rectangle" | "horizontal";
  className?: string;
};

/**
 * 디스플레이 광고 슬롯을 렌더하고 경로가 바뀔 때마다 다시 요청한다.
 */
const AdUnit = ({
  clientId,
  slotId,
  format = "auto",
  className,
}: AdUnitProps) => {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const adsWindow = window as Window & {
        adsbygoogle?: unknown[];
      };
      adsWindow.adsbygoogle = adsWindow.adsbygoogle ?? [];
      adsWindow.adsbygoogle.push({});
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[광고 슬롯 초기화 실패]", error);
      }
    }
  }, [pathname, slotId]);

  return (
    <aside
      className={cn("w-full overflow-hidden", className)}
      aria-label="광고"
    >
      <p className="mb-2 text-center text-[11px] tracking-wide text-muted-foreground">
        광고
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
};

export default AdUnit;
