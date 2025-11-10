/**
 * @file sitemap.ts
 * @description sitemap.xml 생성
 *
 * 동적 sitemap 생성은 복잡하므로 기본 구조만 제공합니다.
 * 필요시 한국관광공사 API를 사용하여 모든 관광지 페이지를 포함할 수 있습니다.
 */

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/bookmarks`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}

