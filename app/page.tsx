/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록 및 지도 (마스키 플로우 레이아웃)
 *
 * 주요 기능:
 * 1. Hero 섹션 + 대형 검색창
 * 2. Sticky 필터 컨트롤 및 요약 뱃지
 * 3. 리스트-지도 분할 레이아웃 (모바일 탭 전환 지원)
 * 4. 검색/필터 상태 동기화 및 페이지네이션(더 보기 방식)
 * 5. 네이버 지도와 리스트 상호작용
 */

"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TourList } from "@/components/tour-list";
import { TourFilters, type FilterState } from "@/components/tour-filters";
import { TourSearch } from "@/components/tour-search";
import { NaverMap } from "@/components/naver-map";
import { TourSort } from "@/components/tour-sort";
import { ErrorDisplay } from "@/components/ui/error";
import { CardListSkeleton, Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import type { TourItem } from "@/lib/types/tour";
import { getTourList, searchTours } from "@/lib/api/tour-api";
import { cn } from "@/lib/utils";
import { CONTENT_TYPES } from "@/lib/types/tour";
import {
  getNextSelectedTourId,
  isSameOrder,
  mergeAndSortTours,
  sortTours,
  type SortOrder,
} from "@/lib/tour/sort";
import { Filter, List, Map as MapIcon } from "lucide-react";

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

const PAGE_SIZE = 20;
const SCROLL_OPTIONS: ScrollIntoViewOptions = {
  behavior: "smooth",
  block: "start",
  inline: "nearest",
};

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [tours, setTours] = useState<TourItem[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isMapVisible, setIsMapVisible] = useState(true);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  const filtersSectionRef = useRef<HTMLDivElement | null>(null);
  const mapSectionRef = useRef<HTMLDivElement | null>(null);
  const toursRef = useRef<TourItem[]>([]);
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(
    new Map<string, HTMLDivElement | null>()
  );
  const isProgrammaticScroll = useRef(false);
  const sortOrderRef = useRef<SortOrder>("latest");

  const handleRegisterCardRef = useCallback(
    (id: string, node: HTMLDivElement | null) => {
      if (!node) {
        cardRefs.current.delete(id);
        return;
      }
      cardRefs.current.set(id, node);
    },
    []
  );

  // URL keyword 동기화
  useEffect(() => {
    const keywordFromParams = searchParams.get("keyword") ?? "";
    setSearchKeyword((prev) =>
      prev === keywordFromParams ? prev : keywordFromParams
    );
  }, [searchParams]);

  useEffect(() => {
    sortOrderRef.current = sortOrder;
  }, [sortOrder]);

  useEffect(() => {
    toursRef.current = tours;
  }, [tours]);

  // 필터 또는 검색어 변경 시 목록 초기화
  useEffect(() => {
    setTours([]);
    setPage(1);
  }, [filters, searchKeyword]);

  // 데이터 패칭
  useEffect(() => {
    let ignore = false;

    const fetchTours = async () => {
      const isFirstPage = page === 1;

      if (isFirstPage) {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      console.groupCollapsed("[HomePage] fetchTours");
      console.log("filters", filters);
      console.log("searchKeyword", searchKeyword);
      console.log("page", page);
      console.log("sortOrder", sortOrderRef.current);
      console.groupEnd();

      try {
        const baseParams = {
          areaCode: filters.areaCode,
          contentTypeId: filters.contentTypeId,
          numOfRows: PAGE_SIZE,
          pageNo: page,
        };

        const response = searchKeyword.trim()
          ? await searchTours({
              ...baseParams,
              keyword: searchKeyword.trim(),
            })
          : await getTourList(baseParams);

        if (ignore) return;

        const incomingTours = response.items;
        const activeSortOrder = sortOrderRef.current;
        const existingTours = isFirstPage ? [] : toursRef.current;
        const sortedTours = mergeAndSortTours(
          existingTours,
          incomingTours,
          activeSortOrder
        );

        toursRef.current = sortedTours;
        setTours(sortedTours);
        setTotalCount(response.totalCount);

        if (isFirstPage) {
          isProgrammaticScroll.current = true;
        }
        setSelectedTourId((prev) =>
          getNextSelectedTourId(sortedTours, isFirstPage ? undefined : prev)
        );
      } catch (err) {
        if (ignore) return;
        setError(
          err instanceof Error
            ? err.message
            : "관광지 정보를 불러오는데 실패했습니다."
        );
      } finally {
        if (ignore) return;
        if (page === 1) {
          setIsInitialLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    };

    fetchTours();

    return () => {
      ignore = true;
    };
  }, [filters, searchKeyword, page]);

  useEffect(() => {
    if (!isMapVisible) {
      setMobileView("list");
    }
  }, [isMapVisible]);

  useEffect(() => {
    if (!selectedTourId) {
      return;
    }

    console.groupCollapsed("[HomePage] selection");
    console.log("selectedTourId", selectedTourId);
    console.groupEnd();

    if (!isProgrammaticScroll.current) {
      return;
    }

    const targetNode = cardRefs.current.get(selectedTourId);
    if (targetNode) {
      targetNode.scrollIntoView(SCROLL_OPTIONS);
    }

    isProgrammaticScroll.current = false;
  }, [selectedTourId]);

  useEffect(() => {
    if (toursRef.current.length === 0) {
      return;
    }

    const sorted = sortTours(toursRef.current, sortOrder);
    if (isSameOrder(toursRef.current, sorted)) {
      return;
    }

    toursRef.current = sorted;
    setTours(sorted);
    isProgrammaticScroll.current = true;
    setSelectedTourId((prev) => getNextSelectedTourId(sorted, prev));
  }, [sortOrder]);

  const handleSearch = (keyword: string) => {
    const trimmed = keyword.trim();
    const targetUrl = trimmed ? `/?keyword=${encodeURIComponent(trimmed)}` : "/";
    router.replace(targetUrl, { scroll: true });
    setSearchKeyword(trimmed);
    setPage(1);
  };

  const handleSortChange = (order: SortOrder) => {
    console.groupCollapsed("[HomePage] sort");
    console.log("order", order);
    console.groupEnd();
    setSortOrder(order);
  };

  const scrollToFilters = () => {
    setMobileView("list");
    filtersSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectTour = (
    tourId?: string,
    source: "list" | "map" | "auto" = "list"
  ) => {
    if (!tourId) {
      setSelectedTourId(undefined);
      return;
    }

    isProgrammaticScroll.current = source !== "list";
    setSelectedTourId(tourId);

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileView("map");
      if (source === "list") {
        setTimeout(() => {
          mapSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 120);
      }
    }
  };

  const retryFetch = () => {
    setError(null);
    setTours([]);
    setPage(1);
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
  const hasMore = tours.length < totalCount;

  if (error) {
    return (
      <ErrorDisplay
        message={error}
        onRetry={retryFetch}
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
            한국의 아름다운 관광지를 탐험하세요
          </h1>
          <p className="max-w-2xl text-base text-gray-600 dark:text-gray-400 sm:text-lg">
            지역별 필터와 맞춤형 검색으로 나만의 여행지를 빠르게 찾아보세요. 네이버 지도와 연동된 생생한 위치 정보를 제공합니다.
          </p>
          <TourSearch
            onSearch={handleSearch}
            initialKeyword={searchKeyword}
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
          {/* Sticky summary toolbar (Desktop) */}
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
              <TourSort
                value={sortOrder}
                onChange={handleSortChange}
                size="sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-blue-600 transition hover:border-blue-100 hover:bg-blue-50 dark:text-blue-300 dark:hover:border-blue-900 dark:hover:bg-blue-950/40"
                onClick={() => setIsFiltersCollapsed((prev) => !prev)}
                aria-expanded={!isFiltersCollapsed}
                aria-controls="desktop-filters"
              >
                <Filter className="h-4 w-4" />
                {isFiltersCollapsed ? "필터 펼치기" : "상세 필터"}
              </Button>
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
                    <List className="h-4 w-4" /> 리스트만 보기
                  </>
                ) : (
                  <>
                    <MapIcon className="h-4 w-4" /> 지도 함께 보기
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left column */}
            <div className="space-y-6">
              <div
                ref={filtersSectionRef}
                className="rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-md shadow-gray-200/50 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-none"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    필터
                  </h2>
                  <div className="flex items-center gap-3">
                    <TourSort
                      value={sortOrder}
                      onChange={handleSortChange}
                      size="sm"
                      className="lg:hidden"
                    />
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
                </div>
                <div
                  id="desktop-filters"
                  className={cn(
                    "transition-[max-height,opacity] duration-300 ease-in-out",
                    isFiltersCollapsed ? "max-h-0 overflow-hidden opacity-0" : "opacity-100"
                  )}
                >
                  <TourFilters filters={filters} onFiltersChange={setFilters} />
                </div>
              </div>

              {/* Mobile view toggle */}
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

              {/* List */}
              <div
                className={cn(
                  "rounded-2xl border border-gray-200/80 bg-white/95 p-5 shadow-lg shadow-gray-200/50 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-none",
                  mobileView === "map" ? "hidden lg:block" : "block"
                )}
                role="region"
                aria-label="관광지 목록"
              >
                {isInitialLoading ? (
                  <Loading text="관광지 정보를 불러오는 중..." />
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>총 {totalCountLabel}개의 관광지</span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                        페이지 {page}
                      </span>
                    </div>
                    {tours.length === 0 ? (
                      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center text-sm text-gray-500 dark:text-gray-400">
                        <p>선택한 조건에 맞는 관광지가 없습니다.</p>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full px-5"
                          onClick={() => setFilters({})}
                        >
                          모든 관광지 보기
                        </Button>
                      </div>
                    ) : (
                      <>
                        <TourList
                          tours={tours}
                          selectedTourId={selectedTourId}
                          onSelectTour={handleSelectTour}
                          getCardRef={handleRegisterCardRef}
                        />
                        {isLoadingMore && (
                          <div className="mt-6">
                            <CardListSkeleton count={3} />
                          </div>
                        )}
                        {hasMore && (
                          <div className="mt-6 flex justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full px-6"
                              onClick={() => setPage((prev) => prev + 1)}
                              disabled={isLoadingMore}
                            >
                              {isLoadingMore ? "불러오는 중..." : "더 보기"}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Map */}
            {isMapVisible && (
              <div
                className={cn(mobileView === "list" ? "hidden lg:block" : "block")}
                ref={mapSectionRef}
              >
                <div className="sticky top-[100px]">
                  <div className="rounded-2xl border border-gray-200/80 bg-white/95 shadow-lg shadow-gray-200/60 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-none">
                    {isInitialLoading ? (
                      <div className="flex h-[400px] items-center justify-center">
                        <Loading text="지도를 초기화하는 중..." />
                      </div>
                    ) : tours.length === 0 ? (
                      <div className="flex h-[400px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                        표시할 관광지가 없습니다.
                      </div>
                    ) : (
                      <NaverMap
                        tours={tours}
                        selectedTourId={selectedTourId}
                        onMarkerClick={(tour) =>
                          handleSelectTour(tour.contentid, "map")
                        }
                        className="h-[600px]"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loading text="페이지를 불러오는 중..." />
      </main>
    }>
      <HomePageContent />
    </Suspense>
  );
}
