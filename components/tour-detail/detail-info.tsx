/**
 * @file detail-info.tsx
 * @description 관광지 상세 기본 정보 컴포넌트
 *
 * 관광지의 기본 정보를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - 관광지명, 이미지, 주소, 전화번호, 홈페이지, 개요 표시
 * - 주소 복사 기능
 * - 전화번호 클릭 시 전화 연결
 *
 * @dependencies
 * - lib/types/tour: TourDetail 타입
 * - next/image: Image 컴포넌트
 */

"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Copy, Phone, ExternalLink } from "lucide-react";
import type { TourDetail } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface DetailInfoProps {
  detail: TourDetail;
  className?: string;
}

export function DetailInfo({ detail, className }: DetailInfoProps) {
  const handleCopyAddress = async () => {
    const address = `${detail.addr1}${detail.addr2 ? ` ${detail.addr2}` : ""}`;
    try {
      await navigator.clipboard.writeText(address);
      alert("주소가 복사되었습니다.");
    } catch (err) {
      console.error("주소 복사 실패:", err);
    }
  };

  const imageUrl = detail.firstimage || detail.firstimage2 || "/og-image.png";

  return (
    <div className={cn("space-y-6", className)}>
      {/* 대표 이미지 */}
      <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={imageUrl}
          alt={detail.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      {/* 기본 정보 */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">{detail.title}</h1>

        {/* 주소 */}
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="text-gray-600 dark:text-gray-400">
              {detail.addr1}
              {detail.addr2 && ` ${detail.addr2}`}
            </p>
            {detail.zipcode && (
              <p className="text-sm text-gray-500">우편번호: {detail.zipcode}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAddress}
            className="shrink-0"
          >
            <Copy className="w-4 h-4 mr-1" />
            복사
          </Button>
        </div>

        {/* 전화번호 */}
        {detail.tel && (
          <div className="flex items-center gap-2">
            <a
              href={`tel:${detail.tel}`}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Phone className="w-4 h-4" />
              {detail.tel}
            </a>
          </div>
        )}

        {/* 홈페이지 */}
        {detail.homepage && (
          <div className="flex items-center gap-2">
            <a
              href={detail.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              홈페이지 방문
            </a>
          </div>
        )}

        {/* 개요 */}
        {detail.overview && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold mb-2">개요</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {detail.overview}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

