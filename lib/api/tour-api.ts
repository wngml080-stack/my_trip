/**
 * @file tour-api.ts
 * @description 한국관광공사 공공 API 클라이언트
 *
 * 이 파일은 한국관광공사 공공 API (KorService2)를 호출하는 함수들을 제공합니다.
 *
 * 주요 기능:
 * 1. 지역코드 조회 (areaCode2)
 * 2. 지역 기반 관광지 목록 조회 (areaBasedList2)
 * 3. 키워드 검색 (searchKeyword2)
 * 4. 관광지 상세 정보 조회 (detailCommon2, detailIntro2, detailImage2)
 * 5. 반려동물 동반 정보 조회 (detailPetTour2)
 *
 * @dependencies
 * - 환경변수: NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY
 *
 * @see {@link https://www.data.go.kr/data/15101578/openapi.do} - API 문서
 */

import type {
  TourItem,
  TourDetail,
  TourIntro,
  TourImage,
  PetTourInfo,
  AreaCode,
  TourApiResponse,
} from "@/lib/types/tour";

/**
 * API Base URL
 */
const BASE_URL = "/api/tour";

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  return siteUrl ?? "http://localhost:3000";
}

/**
 * 공통 파라미터
 */
const COMMON_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
} as const;

/**
 * API 요청 헬퍼 함수
 */
async function fetchTourApi<T>(
  endpoint: string,
  params: Record<string, string | number>
): Promise<TourApiResponse<T>> {
  const normalizedEndpoint = endpoint.replace(/^\/+/, "");

  const searchParams = new URLSearchParams({
    ...Object.entries(COMMON_PARAMS).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {}
    ),
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    ),
  });

  const baseUrl = getBaseUrl() || "http://localhost:3000";
  const url = `${baseUrl}${BASE_URL}/${normalizedEndpoint}?${searchParams.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // 1시간 캐싱
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }

    const data: TourApiResponse<T> = await response.json();

    // API 에러 체크
    if (data.response.header.resultCode !== "0000") {
      throw new Error(
        `API 에러: ${data.response.header.resultCode} - ${data.response.header.resultMsg}`
      );
    }

    return data;
  } catch (error) {
    console.error("Tour API 요청 에러:", error);
    throw error;
  }
}

/**
 * 지역코드 조회 (areaCode2)
 * @param areaCode 상위 지역코드 (선택, 없으면 시/도 목록)
 */
export async function getAreaCodes(
  areaCode?: string
): Promise<AreaCode[]> {
  const params: Record<string, string> = {};
  if (areaCode) {
    params.areaCode = areaCode;
  }

  const response = await fetchTourApi<AreaCode>("/areaCode2", params);
  const items = response.response.body.items?.item;

  if (!items) {
    return [];
  }

  // 배열이 아닌 경우 배열로 변환
  return Array.isArray(items) ? items : [items];
}

/**
 * 지역 기반 관광지 목록 조회 (areaBasedList2)
 */
export interface GetTourListParams {
  areaCode?: string; // 지역코드
  contentTypeId?: string; // 관광 타입 ID
  numOfRows?: number; // 페이지당 항목 수 (기본: 10)
  pageNo?: number; // 페이지 번호 (기본: 1)
  sigunguCode?: string; // 시군구 코드 (선택)
}

export async function getTourList(
  params: GetTourListParams = {}
): Promise<{ items: TourItem[]; totalCount: number }> {
  const {
    areaCode,
    contentTypeId,
    numOfRows = 10,
    pageNo = 1,
    sigunguCode,
  } = params;

  const apiParams: Record<string, string | number> = {
    numOfRows,
    pageNo,
  };

  if (areaCode) {
    apiParams.areaCode = areaCode;
  }
  if (contentTypeId) {
    apiParams.contentTypeId = contentTypeId;
  }
  if (sigunguCode) {
    apiParams.sigunguCode = sigunguCode;
  }

  const response = await fetchTourApi<TourItem>("/areaBasedList2", apiParams);
  const items = response.response.body.items?.item;
  const totalCount = response.response.body.totalCount || 0;

  if (!items) {
    return { items: [], totalCount: 0 };
  }

  // 배열이 아닌 경우 배열로 변환
  const itemArray = Array.isArray(items) ? items : [items];

  return { items: itemArray, totalCount };
}

/**
 * 키워드 검색 (searchKeyword2)
 */
export interface SearchTourParams {
  keyword: string; // 검색 키워드
  areaCode?: string; // 지역코드 (선택)
  contentTypeId?: string; // 관광 타입 ID (선택)
  numOfRows?: number; // 페이지당 항목 수 (기본: 10)
  pageNo?: number; // 페이지 번호 (기본: 1)
}

export async function searchTours(
  params: SearchTourParams
): Promise<{ items: TourItem[]; totalCount: number }> {
  const {
    keyword,
    areaCode,
    contentTypeId,
    numOfRows = 10,
    pageNo = 1,
  } = params;

  const apiParams: Record<string, string | number> = {
    keyword,
    numOfRows,
    pageNo,
  };

  if (areaCode) {
    apiParams.areaCode = areaCode;
  }
  if (contentTypeId) {
    apiParams.contentTypeId = contentTypeId;
  }

  const response = await fetchTourApi<TourItem>("/searchKeyword2", apiParams);
  const items = response.response.body.items?.item;
  const totalCount = response.response.body.totalCount || 0;

  if (!items) {
    return { items: [], totalCount: 0 };
  }

  // 배열이 아닌 경우 배열로 변환
  const itemArray = Array.isArray(items) ? items : [items];

  return { items: itemArray, totalCount };
}

/**
 * 관광지 상세 정보 조회 (detailCommon2)
 */
export async function getTourDetail(contentId: string): Promise<TourDetail | null> {
  const response = await fetchTourApi<TourDetail>("/detailCommon2", {
    contentId,
  });

  const items = response.response.body.items?.item;

  if (!items) {
    return null;
  }

  // 배열이 아닌 경우 그대로 반환, 배열인 경우 첫 번째 항목
  return Array.isArray(items) ? items[0] : items;
}

/**
 * 관광지 운영 정보 조회 (detailIntro2)
 */
export async function getTourIntro(
  contentId: string,
  contentTypeId: string
): Promise<TourIntro | null> {
  const response = await fetchTourApi<TourIntro>("/detailIntro2", {
    contentId,
    contentTypeId,
  });

  const items = response.response.body.items?.item;

  if (!items) {
    return null;
  }

  // 배열이 아닌 경우 그대로 반환, 배열인 경우 첫 번째 항목
  return Array.isArray(items) ? items[0] : items;
}

/**
 * 관광지 이미지 목록 조회 (detailImage2)
 */
export async function getTourImages(contentId: string): Promise<TourImage[]> {
  const response = await fetchTourApi<TourImage>("/detailImage2", {
    contentId,
  });

  const items = response.response.body.items?.item;

  if (!items) {
    return [];
  }

  // 배열이 아닌 경우 배열로 변환
  return Array.isArray(items) ? items : [items];
}

/**
 * 반려동물 동반 정보 조회 (detailPetTour2)
 */
export async function getPetTourInfo(
  contentId: string
): Promise<PetTourInfo | null> {
  const response = await fetchTourApi<PetTourInfo>("/detailPetTour2", {
    contentId,
  });

  const items = response.response.body.items?.item;

  if (!items) {
    return null;
  }

  // 배열이 아닌 경우 그대로 반환, 배열인 경우 첫 번째 항목
  return Array.isArray(items) ? items[0] : items;
}

