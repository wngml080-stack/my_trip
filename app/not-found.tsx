/**
 * @file not-found.tsx
 * @description 404 페이지
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-600 dark:text-gray-400">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link href="/">
          <Button>
            <Home className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </main>
  );
}

