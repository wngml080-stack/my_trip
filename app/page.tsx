/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록 및 지도
 *
 * 홈페이지는 관광지 목록, 필터, 검색, 지도를 통합하여 표시합니다.
 *
 * 주요 기능:
 * 1. 관광지 목록 표시 (필터링, 검색 지원)
 * 2. 네이버 지도 연동
 * 3. 리스트-지도 상호작용
 *
 * @dependencies
 * - components/tour-list: TourList 컴포넌트
 * - components/tour-filters: TourFilters 컴포넌트
 * - components/tour-search: TourSearch 컴포넌트
 * - components/naver-map: NaverMap 컴포넌트
 * - lib/api/tour-api: getTourList, searchTours
 */

"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { TourList } from "@/components/tour-list";
import { TourFilters, type FilterState } from "@/components/tour-filters";
import { TourSearch } from "@/components/tour-search";
import { NaverMap } from "@/components/naver-map";
import { ErrorDisplay } from "@/components/ui/error";
import { Loading } from "@/components/ui/loading";
import type { TourItem } from "@/lib/types/tour";
import { Button } from "@/components/ui/button";
import { getTourList, searchTours } from "@/lib/api/tour-api";
import { cn } from "@/lib/utils";
import { CONTENT_TYPES } from "@/lib/types/tour";
import { Filter, List, Map } from "lucide-react";

const AREA_LABELS: Record<string, string> = {
  "1": "서울",
  "2": "인천",
  "3": "대전",
  "4": "대구",
  "5": "광주",
  "6": "부산",
  "7": "울산",
  "8": "세종",
  "31": "경기",
  "32": "강원",
  "33": "충북",
  "34": "충남",
  "35": "경북",
  "36": "경남",
  "37": "전북",
  "38": "전남",
  "39": "제주",
};

export default function HomePage() {
  const [tours, setTours] = useState<TourItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedTourId, setSelectedTourId] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const filtersSectionRef = useRef<HTMLDivElement | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  // 관광지 목록 로드
  const loadTours = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (searchKeyword.trim()) {
        // 검색 모드
        result = await searchTours({
          keyword: searchKeyword,
          areaCode: filters.areaCode,
          contentTypeId: filters.contentTypeId,
          numOfRows: 20,
          pageNo: page,
        });
      } else {
        // 필터 모드
        result = await getTourList({
          areaCode: filters.areaCode,
          contentTypeId: filters.contentTypeId,
          numOfRows: 20,
          pageNo: page,
        });
      }

      setTours(result.items);
      setTotalCount(result.totalCount);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "관광지 정보를 불러오는데 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchKeyword, page]);

  // 필터 또는 검색어 변경 시 목록 다시 로드
  useEffect(() => {
    setPage(1); // 페이지 초기화
    loadTours();
  }, [filters, searchKeyword]);

  // 페이지 변경 시 목록 다시 로드
  useEffect(() => {
    if (page > 1) {
      loadTours();
    }
  }, [page]);

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setPage(1);
  };

  const handleTourClick = (tourId: string) => {
    setSelectedTourId(tourId);
  };

  const scrollToFilters = () => {
    setMobileView("list");
    filtersSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const areaLabel = useMemo(() => {
    if (!filters.areaCode) return "전체 지역";
    return AREA_LABELS[filters.areaCode] ?? "선택한 지역";
  }, [filters.areaCode]);

  const typeLabel = useMemo(() => {
    if (!filters.contentTypeId) return "전체 타입";
    const type = CONTENT_TYPES.find((item) => item.id === filters.contentTypeId);
    return type?.name ?? "선택한 타입";
  }, [filters.contentTypeId]);

  const petLabel = filters.petFriendly ? "반려동물 가능" : "전체 옵션";
  const totalCountLabel = totalCount.toLocaleString();

  if (error) {
    return (
      <ErrorDisplay
        message={error}
        onRetry={loadTours}
        className="min-h-[calc(100vh-80px)]"
      />
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50/60 via-white to-white dark:from-slate-950 dark:via-gray-950 dark:to-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-64 w-[80vw] -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-900/20" />
        </div>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pb-16 pt-12 text-center sm:pt-16 lg:pt-20">
          <span className="inline-flex items-center rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 shadow-sm shadow-blue-100/70 ring-1 ring-blue-200/60 dark:bg-gray-900/80 dark:text-blue-300 dark:ring-blue-900/60">
            국내 여행 정보 포털
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
            한국의 아름다운 관광지를 탐험하세요
          </h1>
          <p className="max-w-2xl text-base text-gray-600 sm:text-lg dark:text-gray-400">
            지역별 필터와 맞춤형 검색으로 나만의 여행지를 빠르게 찾아보세요.
            네이버 지도와 연동된 생생한 위치 정보를 제공합니다.
          </p>
          <TourSearch
            onSearch={handleSearch}
            size="lg"
            showFilterButton
            onFilterClick={scrollToFilters}
            className="w-full max-w-3xl"
          />
          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 shadow-sm ring-1 ring-gray-200/70 dark:bg-gray-900/70 dark:ring-gray-800/60">
              📍 총 {totalCountLabel}개의 관광지 데이터
            </span>
            <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 shadow-sm ring-1 ring-gray-200/70 dark:bg-gray-900/70 dark:ring-gray-800/60">
              🗺️ 리스트 & 지도 동시 확인
            </span>
            <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 shadow-sm ring-1 ring-gray-200/70 dark:bg-gray-900/70 dark:ring-gray-800/60">
              🐾 반려동물 동반 필터 제공
            </span>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative z-10 -mt-10 pb-16">
        <div className="mx-auto max-w-6xl space-y-10 px-4">
          <div className="sticky top-[84px] z-30 hidden rounded-2xl border border-blue-100/70 bg-white/90 p-4 shadow-lg shadow-blue-100/50 backdrop-blur lg:flex dark:border-blue-900/40 dark:bg-gray-900/90 dark:shadow-none">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-blue-100 bg-blue-50/70 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200 dark:hover:bg-blue-950/60"
                onClick={scrollToFilters}
              >
                지역: {areaLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-gray-200 bg-white/80 text-gray-600 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={scrollToFilters}
              >
                타입: {typeLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-gray-200 bg-white/80 text-gray-600 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={scrollToFilters}
              >
                {petLabel}
              </Button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  isMapVisible
                    ? "border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                    : "border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
                onClick={() => setIsMapVisible((prev) => !prev)}
                aria-pressed={isMapVisible}
                aria-label={isMapVisible ? "지도 숨기기" : "지도 표시"}
              >
                {isMapVisible ? (
                  <>
                    <List className="h-4 w-4" />
                    리스트만 보기
                  </>
                ) : (
                  <>
                    <Map className="h-4 w-4" />
                    지도 함께 보기
                  </>
                )}
              </Button>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                정렬: 최신순
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-blue-600 transition hover:border-blue-100 hover:bg-blue-50 dark:text-blue-300 dark:hover:border-blue-900 dark:hover:bg-blue-950/40"
                onClick={scrollToFilters}
              >
                <Filter className="h-4 w-4" />
                상세 필터
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* 좌측: 필터 및 목록 */}
            <div className="space-y-6">
              {/* 필터 */}
              <div
                className="rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-md shadow-gray-200/50 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-none"
                ref={filtersSectionRef}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    필터
                  </h2>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-full px-3 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
                    onClick={() => setFilters({})}
                  >
                    초기화
                  </Button>
                </div>
                <TourFilters filters={filters} onFiltersChange={setFilters} />
              </div>

              {/* 모바일 전용 탭 */}
              <div className="flex items-center justify-between gap-3 lg:hidden">
                <div
                  className="flex w-full items-center rounded-full border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                  role="tablist"
                  aria-label="홈페이지 보기 전환"
                >
                  <button
                    type="button"
                    className={cn(
                      "flex-1 rounded-full px-4 py-2 text-sm font-medium transition",
                      mobileView === "list"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    )}
                    onClick={() => setMobileView("list")}
                    role="tab"
                    aria-selected={mobileView === "list"}
                    tabIndex={mobileView === "list" ? 0 : -1}
                  >
                    목록
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex-1 rounded-full px-4 py-2 text-sm font-medium transition",
                      mobileView === "map"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    )}
                    onClick={() => setMobileView("map")}
                    role="tab"
                    aria-selected={mobileView === "map"}
                    tabIndex={mobileView === "map" ? 0 : -1}
                  >
                    지도
                  </button>
                </div>
              </div>

              {/* 목록 */}
              <div
                className={cn(
                  "rounded-2xl border border-gray-200/80 bg-white/95 p-5 shadow-lg shadow-gray-200/50 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-none",
                  mobileView === "map" ? "hidden lg:block" : "block"
                )}
                role="region"
                aria-label="관광지 목록"
              >
                {isLoading ? (
                  <Loading text="관광지 정보를 불러오는 중..." />
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>총 {totalCountLabel}개의 관광지</span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                        페이지 {page} / {Math.max(Math.ceil(totalCount / 20), 1)}
                      </span>
                    </div>
                    <TourList
                      tours={tours}
                      isLoading={false}
                      selectedTourId={selectedTourId}
                      onSelectTour={setSelectedTourId}
                    />
                  </>
                )}
              </div>
            </div>

            {/* 우측: 지도 */}
            {isMapVisible && (
              <div
                className={cn(
                  mobileView === "list" ? "hidden lg:block" : "block"
                )}
              >
                <div className="sticky top-[100px]">
                  <div className="rounded-2xl border border-gray-200/80 bg-white/95 shadow-lg shadow-gray-200/60 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-none">
                    <NaverMap
                      tours={tours}
                      selectedTourId={selectedTourId}
                      onMarkerClick={(tour) => {
                        setSelectedTourId(tour.contentid);
                      }}
                      className="h-[600px]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 페이지네이션 (간단 버전) */}
          {!isLoading && totalCount > 0 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full px-6"
              >
                이전
              </Button>
              <span className="flex h-11 min-w-[96px] items-center justify-center rounded-full border border-transparent bg-blue-600 px-4 text-sm font-semibold text-white dark:bg-blue-500">
                {page} / {Math.max(Math.ceil(totalCount / 20), 1)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(totalCount / 20)}
                className="rounded-full px-6"
              >
                다음
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
