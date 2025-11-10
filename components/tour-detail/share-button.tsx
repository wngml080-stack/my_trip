/**
 * @file share-button.tsx
 * @description URL 공유 버튼 컴포넌트
 *
 * 관광지 상세페이지 URL을 클립보드에 복사하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - URL 클립보드 복사
 * - 복사 완료 토스트 메시지
 *
 * @dependencies
 * - components/ui/button: Button 컴포넌트
 * - lucide-react: Share2 아이콘
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  contentId: string;
  title?: string;
  className?: string;
}

export function ShareButton({
  contentId,
  title,
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/places/${contentId}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("URL 복사 실패:", err);
      alert("URL 복사에 실패했습니다.");
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleShare}
      className={cn("gap-2", className)}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          복사됨
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          공유하기
        </>
      )}
    </Button>
  );
}

