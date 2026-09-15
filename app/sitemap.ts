import type { MetadataRoute } from "next";
import { getAllGuides } from "@/lib/knitbook/guides";
import { getSiteUrl } from "@/lib/knitbook/site";

/**
 * 공개 페이지만 사이트맵에 넣어 크롤러가 따라오게 한다.
 */
const sitemap = (): MetadataRoute.Sitemap => {
  const siteUrl = getSiteUrl();
  const lastModified = new Date("2026-09-15");

  const staticPaths = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/guides", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/privacy", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/terms", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  const staticEntries = staticPaths.map((entry) => ({
    url: `${siteUrl}${entry.path}`,
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
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
