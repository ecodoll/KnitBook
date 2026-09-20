import type { Metadata } from "next";
import { getPageUrl } from "@/lib/knitbook/site";

/**
 * 공개 페이지 메타데이터에 정규 URL을 붙인다.
 */
const withPublicCanonical = (path: string, metadata: Metadata): Metadata => {
  const url = getPageUrl(path);

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: url,
    },
    openGraph: {
      ...metadata.openGraph,
      url,
    },
  };
};

export { withPublicCanonical };
