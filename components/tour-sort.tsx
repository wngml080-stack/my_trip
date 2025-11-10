"use client";

/**
 * @file tour-sort.tsx
 * @description 관광지 정렬 옵션 선택 컴포넌트
 */

import { cn } from "@/lib/utils";
import type { SortOrder } from "@/lib/tour/sort";

interface TourSortProps {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
  className?: string;
  size?: "sm" | "md";
}

export function TourSort({
  value,
  onChange,
  className,
  size = "md",
}: TourSortProps) {
  const baseSelectClasses =
    "rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200";
  const sizeClasses =
    size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm font-medium";

  return (
    <label
      className={cn(
        "flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300",
        className
      )}
    >
      <span className="whitespace-nowrap">정렬</span>
      <select
        value={value}
        className={cn(baseSelectClasses, sizeClasses)}
        onChange={(event) => onChange(event.target.value as SortOrder)}
        aria-label="정렬 순서 선택"
      >
        <option value="latest">최신순</option>
        <option value="name">이름순</option>
      </select>
    </label>
  );
}

