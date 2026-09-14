import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/knitbook/site";

/**
 * 검색 엔진과 애드센스 크롤러가 볼 경로를 안내한다.
 */
const robots = (): MetadataRoute.Robots => {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/signup",
          "/reset-password",
          "/auth/",
          "/patterns/",
          "/projects/",
          "/yarns/",
        ],
      },
      {
        userAgent: "Mediapartners-Google",
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
};

export default robots;
