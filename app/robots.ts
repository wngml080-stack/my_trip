/**
 * @file robots.ts
 * @description robots.txt 생성
 */

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth-test", "/storage-test"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/sitemap.xml`,
  };
}

