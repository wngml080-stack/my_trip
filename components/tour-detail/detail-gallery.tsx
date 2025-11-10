"use client";

/**
 * @file detail-gallery.tsx
 * @description 관광지 상세 이미지 갤러리 컴포넌트
 *
 * - 대표 이미지 + 썸네일 목록
 * - 전체보기 모달(슬라이드) 지원
 * - 이미지 부재 시 대체 메시지 표시
 */

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import type { TourImage } from "@/lib/types/tour";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DetailGalleryProps {
  images: TourImage[];
  className?: string;
}

const FALLBACK_IMAGE = "/og-image.png";

function buildImageLabel(image: TourImage | null, index: number): string {
  if (image?.imagename) {
    return image.imagename;
  }
  return `이미지 ${index + 1}`;
}

export function DetailGallery({ images, className }: DetailGalleryProps) {
  const preparedImages = useMemo(
    () =>
      images.filter(
        (image) => image.originimgurl || image.smallimageurl
      ),
    [images]
  );

  const hasImages = preparedImages.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const currentImage = hasImages ? preparedImages[activeIndex] : null;
  const currentLabel = buildImageLabel(currentImage, activeIndex);

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  const handlePrev = () => {
    if (!hasImages) return;
    setActiveIndex((prev) =>
      prev === 0 ? preparedImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (!hasImages) return;
    setActiveIndex((prev) =>
      prev === preparedImages.length - 1 ? 0 : prev + 1
    );
  };

  if (!hasImages) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400",
          className
        )}
      >
        <span>이미지를 준비 중이에요.</span>
        <span>조만간 더 나은 콘텐츠로 업데이트될 예정입니다.</span>
      </div>
    );
  }

  return (
    <section className={cn("space-y-4", className)} aria-label="이미지 갤러리">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 shadow-md dark:bg-gray-800">
        <Image
          src={currentImage?.originimgurl ?? FALLBACK_IMAGE}
          alt={currentLabel}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 75vw"
          priority
        />
        <div className="absolute bottom-4 right-4 flex gap-2">
          {preparedImages.length > 1 && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handlePrev}
                aria-label="이전 이미지"
                className="rounded-full bg-white/90 text-gray-700 shadow hover:bg-white dark:bg-gray-900/80 dark:text-gray-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleNext}
                aria-label="다음 이미지"
                className="rounded-full bg-white/90 text-gray-700 shadow hover:bg-white dark:bg-gray-900/80 dark:text-gray-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            aria-label="전체보기"
            className="rounded-full bg-white/90 text-gray-700 shadow hover:bg-white dark:bg-gray-900/80 dark:text-gray-200"
          >
            <Expand className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {preparedImages.map((image, index) => {
          const label = buildImageLabel(image, index);
          const isActive = index === activeIndex;

          return (
            <button
              key={`${image.contentid}-${index}`}
              type="button"
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                "relative h-20 w-32 overflow-hidden rounded-xl border transition focus:outline-hidden focus:ring-2 focus:ring-blue-500",
                isActive
                  ? "border-blue-500 ring-2 ring-blue-300"
                  : "border-transparent hover:ring-2 hover:ring-blue-200"
              )}
              aria-label={`${label} 썸네일`}
              aria-current={isActive ? "true" : undefined}
            >
              <Image
                src={image.smallimageurl ?? image.originimgurl ?? FALLBACK_IMAGE}
                alt={`${label} 썸네일`}
                fill
                sizes="128px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          aria-label="이미지 전체 보기"
          className="max-w-4xl space-y-4 bg-white dark:bg-gray-900"
        >
          <DialogHeader className="flex flex-col gap-1">
            <DialogTitle className="text-lg font-semibold">
              이미지 전체 보기
            </DialogTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentLabel}
            </p>
          </DialogHeader>

          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
            <Image
              src={currentImage?.originimgurl ?? FALLBACK_IMAGE}
              alt={currentLabel}
              fill
              sizes="(max-width: 768px) 100vw, 75vw"
              className="object-cover"
            />
            {preparedImages.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={handlePrev}
                  aria-label="이전 이미지"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 text-gray-700 shadow hover:bg-white dark:bg-gray-900/80 dark:text-gray-200"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={handleNext}
                  aria-label="다음 이미지"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 text-gray-700 shadow hover:bg-white dark:bg-gray-900/80 dark:text-gray-200"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {preparedImages.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {preparedImages.map((image, index) => {
                const label = buildImageLabel(image, index);
                const isActive = index === activeIndex;

                return (
                  <button
                    key={`dialog-${image.contentid}-${index}`}
                    type="button"
                    onClick={() => handleThumbnailClick(index)}
                    className={cn(
                      "relative h-16 w-24 overflow-hidden rounded-lg border transition focus:outline-hidden focus:ring-2 focus:ring-blue-500",
                      isActive
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : "border-transparent hover:ring-2 hover:ring-blue-200"
                    )}
                    aria-label={`${label} 썸네일`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <Image
                      src={
                        image.smallimageurl ??
                        image.originimgurl ??
                        FALLBACK_IMAGE
                      }
                      alt={`${label} 썸네일`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}

          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              aria-label="닫기"
              className="w-full sm:w-auto"
            >
              닫기
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </section>
  );
}

