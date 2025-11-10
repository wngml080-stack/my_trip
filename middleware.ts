import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 공개 라우트 정의 (인증 불필요)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/tour(.*)",
  "/places(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
]);

export default clerkMiddleware(async (auth, req) => {
  // 공개 라우트는 인증 체크 스킵
  if (!isPublicRoute(req)) {
    // 환경 변수가 설정되어 있을 때만 인증 체크
    if (process.env.CLERK_SECRET_KEY) {
      await auth.protect();
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
