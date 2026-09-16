"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * 공개 페이지로 이동할 때 스크롤을 맨 위로 올린다.
 */
const ScrollToTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
