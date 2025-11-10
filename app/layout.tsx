import type { Metadata } from "next";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "My Trip - 한국 관광지 정보",
  description: "한국관광공사 공공 API를 활용한 전국 관광지 정보 서비스",
  keywords: ["관광지", "여행", "한국", "관광정보", "My Trip"],
  authors: [{ name: "My Trip" }],
  openGraph: {
    title: "My Trip - 한국 관광지 정보",
    description: "한국관광공사 공공 API를 활용한 전국 관광지 정보 서비스",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "My Trip",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Trip - 한국 관광지 정보",
    description: "한국관광공사 공공 API를 활용한 전국 관광지 정보 서비스",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // 환경 변수가 없으면 Clerk 없이 렌더링 (개발 환경 대비)
  if (!publishableKey) {
    console.warn(
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY가 설정되지 않았습니다. Clerk 기능이 비활성화됩니다."
    );
    return (
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SyncUserProvider>
            <Suspense fallback={<div className="h-16" />}>
              <Navbar />
            </Suspense>
            {children}
          </SyncUserProvider>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      localization={koKR}
    >
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SyncUserProvider>
            <Suspense fallback={<div className="h-16" />}>
              <Navbar />
            </Suspense>
            {children}
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
