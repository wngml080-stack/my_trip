/**
 * @file bookmark-button.tsx
 * @description 북마크 버튼 컴포넌트
 *
 * 관광지를 북마크할 수 있는 버튼 컴포넌트입니다.
 *
 * 주요 기능:
 * - 북마크 추가/제거
 * - 북마크 상태 표시 (별 아이콘)
 * - 로그인하지 않은 경우 로그인 유도
 *
 * @dependencies
 * - lib/api/bookmark-api: addBookmark, removeBookmark, isBookmarked
 * - lib/supabase/clerk-client: useClerkSupabaseClient
 * - @clerk/nextjs: useUser
 * - lucide-react: Star 아이콘
 */

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { addBookmark, removeBookmark, isBookmarked } from "@/lib/api/bookmark-api";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  contentId: string;
  className?: string;
}

export function BookmarkButton({ contentId, className }: BookmarkButtonProps) {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  const [bookmarked, setBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // 북마크 상태 확인
  useEffect(() => {
    if (!isSignedIn || !user?.id) {
      setIsLoading(false);
      return;
    }

    const checkBookmark = async () => {
      const result = await isBookmarked(supabase, contentId, user.id);
      setBookmarked(result);
      setIsLoading(false);
    };

    checkBookmark();
  }, [isSignedIn, user?.id, contentId, supabase]);

  const handleToggle = async () => {
    if (!isSignedIn || !user?.id) {
      router.push("/sign-in");
      return;
    }

    setIsToggling(true);

    try {
      if (bookmarked) {
        const result = await removeBookmark(supabase, contentId, user.id);
        if (result.success) {
          setBookmarked(false);
        } else {
          alert(result.error || "북마크 제거에 실패했습니다.");
        }
      } else {
        const result = await addBookmark(supabase, contentId, user.id);
        if (result.success) {
          setBookmarked(true);
        } else {
          alert(result.error || "북마크 추가에 실패했습니다.");
        }
      }
    } catch (err) {
      console.error("북마크 토글 실패:", err);
      alert("북마크 처리 중 오류가 발생했습니다.");
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Star className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isToggling}
      className={cn(
        "gap-2",
        bookmarked && "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500",
        className
      )}
    >
      <Star
        className={cn(
          "w-4 h-4",
          bookmarked ? "fill-yellow-500 text-yellow-500" : "text-gray-400"
        )}
      />
      {bookmarked ? "북마크됨" : "북마크"}
    </Button>
  );
}

