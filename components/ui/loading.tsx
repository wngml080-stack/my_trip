/**
 * @file loading.tsx
 * @description 로딩 상태 표시 컴포넌트
 */

import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Loading({ className, size = "md", text }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
          sizeClasses[size]
        )}
      />
      {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  );
}

/**
 * 스켈레톤 UI 컴포넌트
 */
interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "image";
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";

  if (variant === "card") {
    return (
      <div className={cn("p-4 space-y-3", className)}>
        <div className={cn(baseClasses, "h-48 w-full")} />
        <div className={cn(baseClasses, "h-4 w-3/4")} />
        <div className={cn(baseClasses, "h-4 w-1/2")} />
      </div>
    );
  }

  if (variant === "image") {
    return <div className={cn(baseClasses, "h-full w-full", className)} />;
  }

  return <div className={cn(baseClasses, "h-4 w-full", className)} />;
}

/**
 * 카드 리스트 스켈레톤
 */
export function CardListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}

