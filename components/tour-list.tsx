/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - TourCard 컴포넌트를 사용하여 목록 표시
 * - 로딩 상태 표시 (스켈레톤)
 * - 빈 상태 표시
 * - 반응형 그리드 레이아웃
 *
 * @dependencies
 * - components/tour-card: TourCard 컴포넌트
 * - components/ui/loading: CardListSkeleton
 * - lib/types/tour: TourItem 타입
 */

import { TourCard } from "@/components/tour-card";
import { CardListSkeleton } from "@/components/ui/loading";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourListProps {
  tours: TourItem[];
  isLoading?: boolean;
  className?: string;
  selectedTourId?: string;
  onSelectTour?: (tourId?: string, source?: "list" | "map" | "auto") => void;
  getCardRef?: (tourId: string, node: HTMLDivElement | null) => void;
  // 일괄 선택 모드
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (tourId: string) => void;
}

export function TourList({
  tours,
  isLoading,
  className,
  selectedTourId,
  onSelectTour,
  getCardRef,
  selectionMode = false,
  selectedIds,
  onToggleSelection,
}: TourListProps) {
  if (isLoading) {
    return <CardListSkeleton count={6} />;
  }

  if (tours.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          관광지 정보가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {tours.map((tour) => (
        <div
          key={tour.contentid}
          ref={(node) => getCardRef?.(tour.contentid, node)}
          className={cn("relative", selectionMode && "group")}
        >
          {selectionMode && (
            <div className="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                checked={selectedIds?.has(tour.contentid) || false}
                onChange={() => onToggleSelection?.(tour.contentid)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                aria-label={`${tour.title} 선택`}
              />
            </div>
          )}
          <TourCard
            tour={tour}
            isActive={selectedTourId === tour.contentid}
            onFocusTour={() => onSelectTour?.(tour.contentid, "list")}
          />
        </div>
      ))}
    </div>
  );
}

