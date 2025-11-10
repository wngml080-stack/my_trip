/**
 * @file bookmark-list.tsx
 * @description 북마크 목록 컴포넌트
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - 북마크 목록 표시
 * - 정렬 옵션 (북마크 추가일순, 이름순, 관광지 수정일순)
 * - 지역별 필터
 * - 일괄 삭제 기능
 *
 * @dependencies
 * - components/tour-list: TourList 컴포넌트
 * - components/tour-sort: TourSort 컴포넌트
 * - lib/api/bookmark-api: getBookmarks, removeBookmark
 * - lib/api/tour-api: getTourDetail (각 북마크의 상세 정보 조회)
 * - lib/tour/sort: sortTours
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { TourList } from "@/components/tour-list";
import { TourSort } from "@/components/tour-sort";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error";
import { Button } from "@/components/ui/button";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { getBookmarks, removeBookmark } from "@/lib/api/bookmark-api";
import { getTourDetail } from "@/lib/api/tour-api";
import { sortTours, type SortOrder } from "@/lib/tour/sort";
import type { TourItem } from "@/lib/types/tour";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type BookmarkItem = TourItem & {
  bookmarkCreatedAt: string;
};

// 실제 북마크 목록 컴포넌트 (모든 훅 사용)
function BookmarkListContent() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  const [bookmarkItems, setBookmarkItems] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");
  const [selectedAreaCode, setSelectedAreaCode] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

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

          // TourDetail을 TourItem 형태로 변환하고 북마크 추가일 포함
          // TourDetail에는 areacode가 없으므로 빈 문자열로 설정
          return {
            contentid: detail.contentid,
            title: detail.title,
            addr1: detail.addr1,
            addr2: detail.addr2,
            mapx: detail.mapx,
            mapy: detail.mapy,
            contenttypeid: detail.contenttypeid,
            areacode: "", // TourDetail에는 areacode가 없음
            firstimage: detail.firstimage,
            firstimage2: detail.firstimage2,
            modifiedtime: detail.modifiedtime || "",
            bookmarkCreatedAt: bookmark.created_at,
          } as BookmarkItem;
        });

        const tourResults = await Promise.all(tourPromises);
        const validTours = tourResults.filter((t) => t !== null) as BookmarkItem[];

        setBookmarkItems(validTours);
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

  // 필터링 및 정렬된 목록
  const filteredAndSortedTours = useMemo(() => {
    let filtered = [...bookmarkItems];

    // 지역 필터
    if (selectedAreaCode) {
      filtered = filtered.filter((item) => item.areacode === selectedAreaCode);
    }

    // 정렬
    if (sortOrder === "latest") {
      // 북마크 추가일 기준 내림차순
      filtered.sort((a, b) =>
        b.bookmarkCreatedAt.localeCompare(a.bookmarkCreatedAt)
      );
    } else {
      // 이름순 정렬 (기존 sortTours 사용)
      filtered = sortTours(filtered, sortOrder) as BookmarkItem[];
    }

    return filtered;
  }, [bookmarkItems, selectedAreaCode, sortOrder]);

  // 지역 코드 목록 추출
  const areaCodes = useMemo(() => {
    const codes = new Set(bookmarkItems.map((item) => item.areacode).filter(Boolean));
    return Array.from(codes).sort();
  }, [bookmarkItems]);

  // 일괄 삭제
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0 || !user?.id) return;

    if (!confirm(`선택한 ${selectedIds.size}개의 북마크를 삭제하시겠습니까?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedIds).map((contentId) =>
        removeBookmark(supabase, contentId, user.id)
      );

      const results = await Promise.all(deletePromises);
      const failed = results.filter((r) => !r.success);

      if (failed.length > 0) {
        alert(`${failed.length}개의 북마크 삭제에 실패했습니다.`);
      }

      // 삭제된 항목 제거
      setBookmarkItems((prev) =>
        prev.filter((item) => !selectedIds.has(item.contentid))
      );
      setSelectedIds(new Set());
    } catch (err) {
      console.error("일괄 삭제 실패:", err);
      alert("북마크 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

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
          총 {bookmarkItems.length}개
        </p>
      </div>

      {/* 정렬 및 필터 컨트롤 */}
      <div className="flex flex-wrap items-center gap-4">
        <TourSort value={sortOrder} onChange={setSortOrder} size="sm" />

        {/* 지역 필터 */}
        {areaCodes.length > 0 && (
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <span className="whitespace-nowrap">지역</span>
            <select
              value={selectedAreaCode}
              onChange={(e) => setSelectedAreaCode(e.target.value)}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              aria-label="지역 필터 선택"
            >
              <option value="">전체</option>
              {areaCodes.map((code) => (
                <option key={code} value={code}>
                  {code === "1" && "서울"}
                  {code === "2" && "인천"}
                  {code === "3" && "대전"}
                  {code === "4" && "대구"}
                  {code === "5" && "광주"}
                  {code === "6" && "부산"}
                  {code === "7" && "울산"}
                  {code === "8" && "세종"}
                  {code === "31" && "경기"}
                  {code === "32" && "강원"}
                  {code === "33" && "충북"}
                  {code === "34" && "충남"}
                  {code === "35" && "경북"}
                  {code === "36" && "경남"}
                  {code === "37" && "전북"}
                  {code === "38" && "전남"}
                  {code === "39" && "제주"}
                  {!["1", "2", "3", "4", "5", "6", "7", "8", "31", "32", "33", "34", "35", "36", "37", "38", "39"].includes(code) && code}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* 일괄 삭제 버튼 */}
        {selectedIds.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBatchDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            선택 삭제 ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* 전체 선택/해제 버튼 */}
      {filteredAndSortedTours.length > 0 && (
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (selectedIds.size === filteredAndSortedTours.length) {
                // 전체 해제
                setSelectedIds(new Set());
              } else {
                // 전체 선택
                setSelectedIds(
                  new Set(filteredAndSortedTours.map((tour) => tour.contentid))
                );
              }
            }}
            className="gap-2"
          >
            {selectedIds.size === filteredAndSortedTours.length
              ? "전체 해제"
              : "전체 선택"}
          </Button>
        </div>
      )}

      {/* 북마크 목록 */}
      {filteredAndSortedTours.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {selectedAreaCode
              ? "해당 지역의 북마크가 없습니다."
              : "북마크한 관광지가 없습니다."}
          </p>
        </div>
      ) : (
        <TourList
          tours={filteredAndSortedTours}
          selectionMode={true}
          selectedIds={selectedIds}
          onToggleSelection={(tourId) => {
            setSelectedIds((prev) => {
              const next = new Set(prev);
              if (next.has(tourId)) {
                next.delete(tourId);
              } else {
                next.add(tourId);
              }
              return next;
            });
          }}
        />
      )}
    </div>
  );
}

// 래퍼 컴포넌트 (환경 변수 체크)
export function BookmarkList() {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkPublishableKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center">
        <p className="text-gray-600">
          Clerk 환경변수가 설정되지 않아 북마크 기능을 사용할 수 없습니다.
        </p>
      </div>
    );
  }

  return <BookmarkListContent />;
}

