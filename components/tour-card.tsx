/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 관광지 목록에서 각 관광지를 카드 형태로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - 썸네일 이미지 표시 (없으면 기본 이미지)
 * - 관광지명, 주소, 타입 뱃지 표시
 * - 클릭 시 상세페이지로 이동
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - lib/types/tour: TourItem 타입
 */

import Image from "next/image";
import Link from "next/link";
import type { TourItem } from "@/lib/types/tour";
import { CONTENT_TYPES } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourCardProps {
  tour: TourItem;
  className?: string;
  isActive?: boolean;
  onFocusTour?: () => void;
  onBlurTour?: () => void;
}

/**
 * 관광 타입 ID로 타입명 찾기
 */
function getContentTypeName(contentTypeId: string): string {
  const type = CONTENT_TYPES.find((t) => t.id === contentTypeId);
  return type?.name || "기타";
}

/**
 * 기본 이미지 URL
 */
const DEFAULT_IMAGE = "/og-image.png";

export function TourCard({
  tour,
  className,
  isActive,
  onFocusTour,
  onBlurTour,
}: TourCardProps) {
  const imageUrl = tour.firstimage || tour.firstimage2 || DEFAULT_IMAGE;
  const contentTypeName = getContentTypeName(tour.contenttypeid);

  return (
    <Link
      href={`/places/${tour.contentid}`}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 dark:border-gray-800 dark:bg-gray-900",
        "hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-100/50",
        isActive &&
          "border-blue-500 shadow-lg shadow-blue-100/60 ring-2 ring-blue-200/70 dark:border-blue-400 dark:ring-blue-900/60",
        className
      )}
      onMouseEnter={() => onFocusTour?.()}
      onFocus={() => onFocusTour?.()}
      onMouseLeave={() => onBlurTour?.()}
      onBlur={() => onBlurTour?.()}
      onClick={() => onFocusTour?.()}
      aria-current={isActive ? "true" : undefined}
    >
      {/* 썸네일 이미지 */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={imageUrl}
          alt={tour.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* 타입 뱃지 */}
        <div className="absolute top-2 right-2">
          <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white shadow-sm shadow-blue-900/30">
            {contentTypeName}
          </span>
        </div>
      </div>

      {/* 카드 내용 */}
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {tour.title}
        </h3>
        <p className="line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
          {tour.addr1}
          {tour.addr2 && ` ${tour.addr2}`}
        </p>
        {tour.tel && (
          <p className="text-xs text-gray-500 dark:text-gray-500">{tour.tel}</p>
        )}
      </div>
    </Link>
  );
}

