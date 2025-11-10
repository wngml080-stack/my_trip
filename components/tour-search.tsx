/**
 * @file tour-search.tsx
 * @description 관광지 검색 컴포넌트
 *
 * 키워드로 관광지를 검색하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - 검색창 입력
 * - 엔터 또는 검색 버튼으로 검색 실행
 * - 검색 결과 개수 표시
 *
 * @dependencies
 * - components/ui/input: Input 컴포넌트
 * - components/ui/button: Button 컴포넌트
 * - lucide-react: Search 아이콘
 */

"use client";

import { useState, FormEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourSearchProps {
  onSearch: (keyword: string) => void;
  initialKeyword?: string;
  className?: string;
  size?: "md" | "lg";
  showFilterButton?: boolean;
  onFilterClick?: () => void;
}

export function TourSearch({
  onSearch,
  initialKeyword = "",
  className,
  size = "md",
  showFilterButton = false,
  onFilterClick,
}: TourSearchProps) {
  const [keyword, setKeyword] = useState(initialKeyword);

  useEffect(() => {
    setKeyword(initialKeyword);
  }, [initialKeyword]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(keyword.trim());
  };

  const isLarge = size === "lg";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full",
        isLarge
          ? "flex flex-col gap-3 sm:flex-row sm:items-stretch"
          : "flex items-center gap-2",
        className
      )}
      role="search"
      aria-label="관광지 검색"
    >
      <div className="relative flex-1">
        <Search
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400",
            isLarge ? "h-5 w-5" : "h-4 w-4 left-3"
          )}
        />
        <Input
          type="search"
          placeholder="관광지명, 주소, 키워드로 검색..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className={cn(
            "w-full border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",
            isLarge
              ? "h-14 rounded-full pl-12 text-base shadow-lg shadow-blue-100/40 focus:ring-blue-500/40 dark:shadow-none"
              : "h-11 rounded-lg pl-10 text-sm"
          )}
        />
      </div>
      <div
        className={cn(
          "flex items-center gap-2",
          isLarge ? "sm:flex-none" : "flex-none"
        )}
      >
        <Button
          type="submit"
          className={cn(
            "font-semibold",
            isLarge
              ? "h-14 rounded-full px-8 text-base shadow-md shadow-blue-200/60"
              : "h-11 rounded-lg px-5 text-sm"
          )}
        >
          검색
        </Button>
        {showFilterButton && (
          <Button
            type="button"
            variant="outline"
            onClick={onFilterClick}
            className={cn(
              "gap-2 border-dashed",
              isLarge
                ? "h-14 rounded-full px-6 text-base"
                : "h-11 rounded-lg px-4 text-sm"
            )}
            aria-label="필터 열기"
          >
            <Filter className={cn(isLarge ? "h-5 w-5" : "h-4 w-4")} />
            필터
          </Button>
        )}
      </div>
    </form>
  );
}

