/**
 * @file page.tsx
 * @description 북마크 목록 페이지
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 페이지입니다.
 *
 * @dependencies
 * - components/bookmarks/bookmark-list: BookmarkList 컴포넌트
 */

"use client";

import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

// Clerk useUser 훅 사용을 위해 동적 렌더링 강제
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function BookmarksPage() {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkPublishableKey) {
    return (
      <main className="min-h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
            <TriangleAlert className="w-16 h-16 text-yellow-500" />
            <h1 className="text-2xl font-bold">Clerk 환경변수가 설정되지 않았어요</h1>
            <p className="text-gray-600">
              `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 환경변수를 설정한 뒤 다시 배포하면
              북마크 기능을 사용할 수 있습니다.
            </p>
            <Link href="/">
              <Button>홈으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="container mx-auto px-4 py-8">
        <BookmarkList />
      </div>
    </main>
  );
}

