/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역, 관광 타입, 반려동물 동반 가능 여부를 필터링하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - 지역 필터 (시/도 선택)
 * - 관광 타입 필터
 * - 반려동물 동반 가능 필터
 *
 * @dependencies
 * - components/ui/button: Button 컴포넌트
 * - lib/types/tour: CONTENT_TYPES, AreaCode 타입
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CONTENT_TYPES } from "@/lib/types/tour";
import type { AreaCode } from "@/lib/types/tour";
import { getAreaCodes } from "@/lib/api/tour-api";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface FilterState {
  areaCode?: string;
  contentTypeId?: string;
  petFriendly?: boolean;
}

interface TourFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

/**
 * 지역 코드 목록 (시/도)
 */
const DEFAULT_AREAS: AreaCode[] = [
  { code: "1", name: "서울" },
  { code: "2", name: "인천" },
  { code: "3", name: "대전" },
  { code: "4", name: "대구" },
  { code: "5", name: "광주" },
  { code: "6", name: "부산" },
  { code: "7", name: "울산" },
  { code: "8", name: "세종" },
  { code: "31", name: "경기" },
  { code: "32", name: "강원" },
  { code: "33", name: "충북" },
  { code: "34", name: "충남" },
  { code: "35", name: "경북" },
  { code: "36", name: "경남" },
  { code: "37", name: "전북" },
  { code: "38", name: "전남" },
  { code: "39", name: "제주" },
];

export function TourFilters({
  filters,
  onFiltersChange,
  className,
}: TourFiltersProps) {
  const [areas, setAreas] = useState<AreaCode[]>(DEFAULT_AREAS);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);

  // 지역 코드 로드 (선택 사항: API에서 동적으로 가져오기)
  useEffect(() => {
    // 필요시 API에서 지역 코드를 가져올 수 있음
    // setIsLoadingAreas(true);
    // getAreaCodes()
    //   .then(setAreas)
    //   .catch(console.error)
    //   .finally(() => setIsLoadingAreas(false));
  }, []);

  const handleAreaChange = (areaCode: string) => {
    onFiltersChange({
      ...filters,
      areaCode: filters.areaCode === areaCode ? undefined : areaCode,
    });
  };

  const handleContentTypeChange = (contentTypeId: string) => {
    onFiltersChange({
      ...filters,
      contentTypeId:
        filters.contentTypeId === contentTypeId ? undefined : contentTypeId,
    });
  };

  const handlePetFriendlyToggle = () => {
    onFiltersChange({
      ...filters,
      petFriendly: !filters.petFriendly,
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* 지역 필터 */}
      <div>
        <h3 className="text-sm font-medium mb-3">지역</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!filters.areaCode ? "default" : "outline"}
            size="sm"
            onClick={() => handleAreaChange("")}
          >
            전체
          </Button>
          {isLoadingAreas ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            areas.map((area) => (
              <Button
                key={area.code}
                variant={filters.areaCode === area.code ? "default" : "outline"}
                size="sm"
                onClick={() => handleAreaChange(area.code)}
              >
                {area.name}
              </Button>
            ))
          )}
        </div>
      </div>

      {/* 관광 타입 필터 */}
      <div>
        <h3 className="text-sm font-medium mb-3">관광 타입</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!filters.contentTypeId ? "default" : "outline"}
            size="sm"
            onClick={() => handleContentTypeChange("")}
          >
            전체
          </Button>
          {CONTENT_TYPES.map((type) => (
            <Button
              key={type.id}
              variant={
                filters.contentTypeId === type.id ? "default" : "outline"
              }
              size="sm"
              onClick={() => handleContentTypeChange(type.id)}
            >
              {type.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 반려동물 동반 필터 */}
      <div>
        <h3 className="text-sm font-medium mb-3">반려동물</h3>
        <Button
          variant={filters.petFriendly ? "default" : "outline"}
          size="sm"
          onClick={handlePetFriendlyToggle}
        >
          🐾 반려동물 동반 가능
        </Button>
      </div>
    </div>
  );
}

