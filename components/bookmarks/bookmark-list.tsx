/**
 * @file bookmark-list.tsx
 * @description 북마크 목록 컴포넌트
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - 북마크 목록 표시
 * - 정렬 옵션 (최신순, 이름순, 지역별)
 * - 일괄 삭제 기능
 *
 * @dependencies
 * - components/tour-list: TourList 컴포넌트
 * - lib/api/bookmark-api: getBookmarks
 * - lib/api/tour-api: getTourDetail (각 북마크의 상세 정보 조회)
 */

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { TourList } from "@/components/tour-list";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { getBookmarks } from "@/lib/api/bookmark-api";
import { getTourDetail } from "@/lib/api/tour-api";
import type { TourItem } from "@/lib/types/tour";
import { useRouter } from "next/navigation";

export function BookmarkList() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  const [tours, setTours] = useState<TourItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !user?.id) {
      router.push("/sign-in");
      return;
    }

    const loadBookmarks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 북마크 목록 가져오기
        const bookmarks = await getBookmarks(supabase, user.id);

        // 각 북마크의 관광지 정보 가져오기
        const tourPromises = bookmarks.map(async (bookmark) => {
          const detail = await getTourDetail(bookmark.content_id);
          if (!detail) return null;

          // TourDetail을 TourItem 형태로 변환
          return {
            contentid: detail.contentid,
            title: detail.title,
            addr1: detail.addr1,
            addr2: detail.addr2,
            mapx: detail.mapx,
            mapy: detail.mapy,
            contenttypeid: detail.contenttypeid,
            areacode: "",
            firstimage: detail.firstimage,
            firstimage2: detail.firstimage2,
            modifiedtime: detail.modifiedtime || "",
          } as TourItem;
        });

        const tourResults = await Promise.all(tourPromises);
        const validTours = tourResults.filter((t) => t !== null) as TourItem[];

        setTours(validTours);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "북마크 목록을 불러오는데 실패했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, [isSignedIn, user?.id, supabase, router]);

  if (!isSignedIn) {
    return null;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (isLoading) {
    return <Loading text="북마크 목록을 불러오는 중..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 북마크</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          총 {tours.length}개
        </p>
      </div>
      <TourList tours={tours} />
    </div>
  );
}

