/**
 * @file error.tsx
 * @description 에러 상태 표시 컴포넌트
 */

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  title = "오류가 발생했습니다",
  message,
  onRetry,
  className,
}: ErrorDisplayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8 text-center",
        className
      )}
    >
      <AlertCircle className="w-12 h-12 text-red-500" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          다시 시도
        </Button>
      )}
    </div>
  );
}

