import type { MetadataRoute } from "next";
import { getAllGuides } from "@/lib/knitbook/guides";
import { getSiteUrl } from "@/lib/knitbook/site";

/**
 * 공개 페이지만 사이트맵에 넣어 크롤러가 따라오게 한다.
 */
const sitemap = (): MetadataRoute.Sitemap => {
  const siteUrl = getSiteUrl();
  const lastModified = new Date("2026-09-09");

  const staticPaths = [
    "",
    "/about",
    "/guides",
    "/privacy",
    "/terms",
    "/contact",
  ];

  const staticEntries = staticPaths.map((path) => ({
    url: `${siteUrl}${path || "/"}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  })) satisfies MetadataRoute.Sitemap;

  const guideEntries = getAllGuides().map((guide) => ({
    url: `${siteUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...guideEntries];
};

export default sitemap;
