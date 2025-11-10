/**
 * @file app/api/tour/[endpoint]/route.ts
 * @description 한국관광공사 공공 API 프록시 라우트
 *
 * 클라이언트에서 직접 공공 API를 호출할 경우 발생하는 CORS 문제를 해결하기 위한 프록시입니다.
 * 허용된 endpoint에 대해서만 요청을 받아 서버 사이드에서 공공 API를 호출한 뒤 결과를 반환합니다.
 */

import { NextResponse } from "next/server";

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

const ALLOWED_ENDPOINTS = new Set([
  "areaBasedList2",
  "searchKeyword2",
  "detailCommon2",
  "detailIntro2",
  "detailImage2",
  "detailPetTour2",
  "areaCode2",
]);

function getApiKey(): string {
  const key = process.env.TOUR_API_KEY || process.env.NEXT_PUBLIC_TOUR_API_KEY;
  if (!key) {
    throw new Error(
      "한국관광공사 API 키가 설정되지 않았습니다. TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY 환경변수를 설정해주세요."
    );
  }
  return key;
}

export async function GET(
  request: Request,
  context: { params: { endpoint: string } }
) {
  const endpoint = context.params.endpoint;

  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return NextResponse.json(
      { error: "지원하지 않는 endpoint 입니다." },
      { status: 400 }
    );
  }

  const apiKey = getApiKey();
  const incomingSearchParams = new URL(request.url).searchParams;
  const proxySearchParams = new URLSearchParams(incomingSearchParams);

  proxySearchParams.delete("serviceKey");
  proxySearchParams.set("serviceKey", apiKey);

  if (!proxySearchParams.has("MobileOS")) {
    proxySearchParams.set("MobileOS", "ETC");
  }
  if (!proxySearchParams.has("MobileApp")) {
    proxySearchParams.set("MobileApp", "MyTrip");
  }
  if (!proxySearchParams.has("_type")) {
    proxySearchParams.set("_type", "json");
  }

  const targetUrl = `${BASE_URL}/${endpoint}?${proxySearchParams.toString()}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok) {
      return NextResponse.json(
        {
          error: "공공 API 요청에 실패했습니다.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, {
        status: response.status,
      });
    }

    const text = await response.text();
    return NextResponse.json({ raw: text }, { status: response.status });
  } catch (error) {
    console.error("Tour API proxy error:", error);
    return NextResponse.json(
      { error: "서버에서 공공 API 호출에 실패했습니다." },
      { status: 500 }
    );
  }
}

