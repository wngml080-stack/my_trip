"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Menu, Search as SearchIcon, Star } from "lucide-react";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }
    const keywordFromParams = searchParams.get("keyword") ?? "";
    setKeyword((prev) =>
      prev === keywordFromParams ? prev : keywordFromParams
    );
  }, [pathname, searchParams]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    const targetUrl = trimmed ? `/?keyword=${encodeURIComponent(trimmed)}` : "/";
    router.push(targetUrl);
    setIsMobileSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/70 backdrop-blur-xl dark:border-gray-800/70 dark:bg-gray-950/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 lg:px-6">
        {/* Left: Logo + Mobile Menu */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200/70 bg-white text-gray-600 transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
            aria-label="메뉴 열기"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-100"
          >
            <BookOpen className="h-6 w-6 text-blue-600" />
            My Trip
          </Link>
        </div>

        {/* Center: Search */}
        <form
          className="hidden flex-1 items-center gap-2 lg:flex"
          onSubmit={handleSubmit}
        >
          <div className="relative w-full">
            <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="관광지, 지역, 키워드로 검색하세요"
              className="h-11 w-full rounded-full border-gray-200 pl-12 pr-4 text-sm shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-900"
              aria-label="관광지 검색"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="default"
            className="h-11 rounded-full px-6 text-sm font-semibold"
          >
            검색
          </Button>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full lg:hidden"
            aria-label="검색 열기"
            aria-expanded={isMobileSearchOpen}
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
          >
            <SearchIcon className="h-5 w-5" />
          </Button>
          <Link
            href="/bookmarks"
            className="hidden items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 lg:flex"
          >
            <Star className="h-4 w-4 text-yellow-500" />
            북마크
          </Link>
          <SignedOut>
            <SignInButton mode="modal">
              <Button className="rounded-full px-5 py-2 text-sm font-semibold shadow-sm">
                로그인
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/bookmarks"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-yellow-500 transition hover:text-yellow-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 lg:hidden"
              aria-label="북마크 페이지로 이동"
            >
              <Star className="h-5 w-5" />
            </Link>
          </SignedIn>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      {/* Mobile search drawer */}
      {isMobileSearchOpen && (
        <div className="border-t border-gray-100 bg-white/95 px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-950 lg:hidden">
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <label htmlFor="mobile-search" className="sr-only">
              모바일 검색 입력
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="mobile-search"
                type="search"
                placeholder="어디로 떠나고 싶으신가요?"
                className="h-11 w-full rounded-full border-gray-200 pl-12 pr-4 text-sm shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-900"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                className="h-11 flex-1 rounded-full text-sm"
                onClick={() => setIsMobileSearchOpen(false)}
              >
                닫기
              </Button>
              <Button
                type="submit"
                className="h-11 flex-1 rounded-full text-sm font-semibold"
              >
                검색
              </Button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};

export default Navbar;
