/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * 네이버 지도 API를 사용하여 관광지 위치를 지도에 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - 관광지 마커 표시
 * - 마커 클릭 시 인포윈도우 표시
 * - 리스트 항목 클릭 시 해당 마커로 이동
 *
 * @dependencies
 * - 네이버 지도 API 스크립트 (외부 스크립트 로드 필요)
 * - lib/types/tour: TourItem, convertCoordinates
 *
 * @see {@link https://navermaps.github.io/maps.js.ncp/docs/} - 네이버 지도 API 문서
 */

"use client";

import { useEffect, useRef, useState } from "react";
import type { TourItem } from "@/lib/types/tour";
import { convertCoordinates } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface NaverMapProps {
  tours: TourItem[];
  selectedTourId?: string;
  onMarkerClick?: (tour: TourItem) => void;
  className?: string;
}

declare global {
  interface Window {
    naver: any;
  }
}

export function NaverMap({
  tours,
  selectedTourId,
  onMarkerClick,
  className,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<
    Array<{ marker: any; infoWindow: any; tourId: string }>
  >([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 네이버 지도 API 스크립트 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`;
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current || !window.naver) {
      return;
    }

    const defaultCenter = new window.naver.maps.LatLng(37.5665, 126.978);
    mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 10,
    });
  }, [isLoaded]);

  // 마커 업데이트
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !window.naver) return;

    // 기존 마커 제거
    markersRef.current.forEach(({ marker, infoWindow }) => {
      infoWindow.close();
      marker.setMap(null);
    });
    markersRef.current = [];

    tours.forEach((tour) => {
      const coords = convertCoordinates(tour.mapx, tour.mapy);
      const position = new window.naver.maps.LatLng(coords.lat, coords.lng);
      const marker = new window.naver.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: tour.title,
      });

      const infoWindow = new window.naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 5px;">${tour.title}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${tour.addr1}</p>
            <a href="/places/${tour.contentid}" style="
              display: inline-block;
              background: #2563eb;
              color: #fff;
              text-decoration: none;
              padding: 6px 12px;
              border-radius: 999px;
              font-size: 12px;
            ">상세보기</a>
          </div>
        `,
      });

      window.naver.maps.Event.addListener(marker, "click", () => {
        infoWindow.open(mapInstanceRef.current, marker);
        onMarkerClick?.(tour);
      });

      markersRef.current.push({ marker, infoWindow, tourId: tour.contentid });
    });

    if (tours.length > 0) {
      const firstTourCoords = convertCoordinates(tours[0].mapx, tours[0].mapy);
      mapInstanceRef.current.setCenter(
        new window.naver.maps.LatLng(firstTourCoords.lat, firstTourCoords.lng)
      );
      mapInstanceRef.current.setZoom(11);
    }
  }, [isLoaded, tours, onMarkerClick]);

  // 선택된 관광지 하이라이트
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !window.naver) return;

    const targetTour = tours.find((tour) => tour.contentid === selectedTourId);

    markersRef.current.forEach(({ marker, infoWindow, tourId }) => {
      if (tourId === selectedTourId) {
        infoWindow.open(mapInstanceRef.current, marker);
      } else {
        infoWindow.close();
      }
    });

    if (targetTour) {
      const coords = convertCoordinates(targetTour.mapx, targetTour.mapy);
      const latLng = new window.naver.maps.LatLng(coords.lat, coords.lng);
      mapInstanceRef.current.panTo(latLng);
      mapInstanceRef.current.setZoom(14);
    }
  }, [isLoaded, selectedTourId, tours]);

  if (!isLoaded) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 dark:bg-gray-800",
          className
        )}
      >
        <p className="text-gray-500">지도를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={cn("w-full h-full min-h-[400px] lg:min-h-[600px]", className)}
    />
  );
}

