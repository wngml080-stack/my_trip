/**
 * @file page.tsx
 * @description 관광지 상세페이지
 *
 * 관광지의 상세 정보를 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 기본 정보 표시 (detailCommon2)
 * 2. 운영 정보 표시 (detailIntro2)
 * 3. 이미지 갤러리 (detailImage2)
 * 4. 지도 표시
 * 5. 공유 기능
 * 6. 반려동물 정보 (detailPetTour2)
 * 7. Open Graph 메타데이터
 *
 * @dependencies
 * - components/tour-detail/*: 상세페이지 컴포넌트들
 * - lib/api/tour-api: getTourDetail, getTourIntro, getTourImages, getPetTourInfo
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { DetailMap } from "@/components/tour-detail/detail-map";
import { ShareButton } from "@/components/tour-detail/share-button";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { DetailGallery } from "@/components/tour-detail/detail-gallery";
import {
  getTourDetail,
  getTourIntro,
  getTourImages,
  getPetTourInfo,
} from "@/lib/api/tour-api";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ contentId: string }>;
}

/**
 * 동적 메타데이터 생성
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { contentId } = await params;
  const detail = await getTourDetail(contentId);

  if (!detail) {
    return {
      title: "관광지 정보를 찾을 수 없습니다",
    };
  }

  const imageUrl = detail.firstimage || detail.firstimage2 || "/og-image.png";
  const description = detail.overview
    ? detail.overview.slice(0, 100)
    : `${detail.title} 관광지 정보`;

  return {
    title: `${detail.title} | My Trip`,
    description,
    openGraph: {
      title: detail.title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: detail.title,
        },
      ],
      type: "website",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/places/${contentId}`,
    },
    twitter: {
      card: "summary_large_image",
      title: detail.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PlaceDetailPage({ params }: PageProps) {
  const { contentId } = await params;

  // 관광지 상세 정보 로드
  const [detail, intro, images, petInfo] = await Promise.all([
    getTourDetail(contentId),
    getTourDetail(contentId).then((d) =>
      d ? getTourIntro(d.contentid, d.contenttypeid) : null
    ),
    getTourImages(contentId),
    getPetTourInfo(contentId),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              목록으로
            </Button>
          </Link>
        </div>

        {/* 기본 정보 */}
        <DetailInfo detail={detail} />

        {/* 공유 및 북마크 버튼 */}
        <div className="mt-6 flex gap-2">
          <ShareButton contentId={contentId} title={detail.title} />
          <BookmarkButton contentId={contentId} />
        </div>

        {/* 운영 정보 */}
        {intro && (
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-semibold mb-4">운영 정보</h2>
            <div className="space-y-3">
              {intro.usetime && (
                <div>
                  <span className="font-medium">이용시간: </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {intro.usetime}
                  </span>
                </div>
              )}
              {intro.restdate && (
                <div>
                  <span className="font-medium">휴무일: </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {intro.restdate}
                  </span>
                </div>
              )}
              {intro.usefee && (
                <div>
                  <span className="font-medium">이용요금: </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {intro.usefee}
                  </span>
                </div>
              )}
              {intro.parking && (
                <div>
                  <span className="font-medium">주차: </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {intro.parking}
                  </span>
                </div>
              )}
              {intro.infocenter && (
                <div>
                  <span className="font-medium">문의처: </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {intro.infocenter}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 이미지 갤러리 */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-semibold mb-4">이미지 갤러리</h2>
          <DetailGallery images={images} />
        </div>

        {/* 반려동물 정보 */}
        {petInfo && (
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              🐾 반려동물 동반 정보
            </h2>
            <div className="space-y-3">
              {petInfo.chkpetleash && (
                <div>
                  <span className="font-medium">동반 여부: </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {petInfo.chkpetleash}
                  </span>
                </div>
              )}
              {petInfo.chkpetsize && (
                <div>
                  <span className="font-medium">크기 제한: </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {petInfo.chkpetsize}
                  </span>
                </div>
              )}
              {petInfo.chkpetplace && (
                <div>
                  <span className="font-medium">입장 가능 장소: </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {petInfo.chkpetplace}
                  </span>
                </div>
              )}
              {petInfo.chkpetfee && (
                <div>
                  <span className="font-medium">추가 요금: </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {petInfo.chkpetfee}
                  </span>
                </div>
              )}
              {petInfo.petinfo && (
                <div>
                  <span className="font-medium">기타 정보: </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {petInfo.petinfo}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 지도 */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <DetailMap detail={detail} />
        </div>
      </div>
    </main>
  );
}

