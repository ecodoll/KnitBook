"use client";

import { usePathname } from "next/navigation";
import KnitBookLogo from "@/components/knitbook/auth/KnitBookLogo";

/**
 * 현재 경로에 맞는 상단 섹션 이름을 돌려준다.
 */
const getSectionLabel = (pathname: string) => {
  if (pathname === "/yarns" || pathname.startsWith("/yarns/")) {
    return "실";
  }
  if (pathname === "/patterns" || pathname.startsWith("/patterns/")) {
    return "도안";
  }
  if (pathname === "/projects" || pathname.startsWith("/projects/")) {
    return "작품";
  }
  return null;
};

/**
 * 홈 로고와 현재 화면 이름을 KnitBook / 작품 형태로 보여 준다.
 */
const AppHeaderBrand = () => {
  const pathname = usePathname();
  const sectionLabel = getSectionLabel(pathname);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <KnitBookLogo variant="inline" />
      {sectionLabel ? (
        <>
          <span className="text-muted-foreground" aria-hidden>
            /
          </span>
          <h1 className="truncate text-base font-semibold tracking-tight">
            {sectionLabel}
          </h1>
        </>
      ) : null}
    </div>
  );
};

export default AppHeaderBrand;
