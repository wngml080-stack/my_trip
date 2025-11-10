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

// Clerk useUser 훅 사용을 위해 동적 렌더링 강제
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function BookmarksPage() {
  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="container mx-auto px-4 py-8">
        <BookmarkList />
      </div>
    </main>
  );
}

