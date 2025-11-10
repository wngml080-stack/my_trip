/**
 * @file detail-map.tsx
 * @description 관광지 상세 지도 컴포넌트
 *
 * 상세페이지에서 해당 관광지의 위치를 지도에 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - 해당 관광지 위치 마커 표시
 * - 길찾기 버튼 (네이버 지도 연동)
 *
 * @dependencies
 * - components/naver-map: NaverMap 컴포넌트 (단일 관광지용)
 * - lib/types/tour: TourDetail, convertCoordinates
 */

"use client";

import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import type { TourDetail } from "@/lib/types/tour";
import { convertCoordinates } from "@/lib/types/tour";
import { NaverMap } from "@/components/naver-map";
import { cn } from "@/lib/utils";

interface DetailMapProps {
  detail: TourDetail;
  className?: string;
}

export function DetailMap({ detail, className }: DetailMapProps) {
  const coords = convertCoordinates(detail.mapx, detail.mapy);
  const hasValidCoords = coords !== null;

  // 네이버 지도 길찾기 URL 생성
  const getNaverMapUrl = () =>
    `https://map.naver.com/v5/search/${encodeURIComponent(detail.title)}`;

  // TourDetail을 TourItem 형태로 변환 (NaverMap 컴포넌트 호환)
  const tourItem = {
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
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          위치
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(getNaverMapUrl(), "_blank")}
        >
          <Navigation className="w-4 h-4 mr-1" />
          길찾기
        </Button>
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
        {hasValidCoords ? (
          <NaverMap tours={[tourItem]} className="h-[400px]" />
        ) : (
          <div className="flex h-[240px] items-center justify-center bg-gray-100 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            제공된 좌표 정보가 없어 지도를 표시할 수 없어요.
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        {hasValidCoords ? (
          <p>위도: {coords.lat.toFixed(6)}, 경도: {coords.lng.toFixed(6)}</p>
        ) : (
          <p>좌표 정보가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

