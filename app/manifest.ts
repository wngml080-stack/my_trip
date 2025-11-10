/**
 * @file manifest.ts
 * @description PWA 매니페스트
 */

import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My Trip - 한국 관광지 정보",
    short_name: "My Trip",
    description: "한국관광공사 공공 API를 활용한 전국 관광지 정보 서비스",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#007bff",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

