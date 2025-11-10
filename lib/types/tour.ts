/**
 * @file tour.ts
 * @description 한국관광공사 API 관광지 데이터 타입 정의
 *
 * 이 파일은 한국관광공사 공공 API (KorService2)의 응답 데이터 구조를
 * TypeScript 타입으로 정의합니다.
 *
 * 주요 타입:
 * - TourItem: 관광지 목록 항목
 * - TourDetail: 관광지 상세 정보
 * - TourIntro: 관광지 운영 정보
 * - TourImage: 관광지 이미지
 * - PetTourInfo: 반려동물 동반 정보
 *
 * @see {@link https://www.data.go.kr/data/15101578/openapi.do} - API 문서
 */

/**
 * 관광지 목록 항목 (areaBasedList2, searchKeyword2 응답)
 */
export interface TourItem {
  addr1: string; // 주소
  addr2?: string; // 상세주소
  areacode: string; // 지역코드
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  title: string; // 제목
  mapx: string; // 경도 (KATEC 좌표계, 정수형)
  mapy: string; // 위도 (KATEC 좌표계, 정수형)
  firstimage?: string; // 대표이미지1
  firstimage2?: string; // 대표이미지2
  tel?: string; // 전화번호
  cat1?: string; // 대분류
  cat2?: string; // 중분류
  cat3?: string; // 소분류
  modifiedtime: string; // 수정일
  overview?: string; // 개요 (검색 결과에 포함될 수 있음)
}

/**
 * 관광지 상세 정보 (detailCommon2 응답)
 */
export interface TourDetail {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  zipcode?: string;
  tel?: string;
  homepage?: string;
  overview?: string; // 개요 (긴 설명)
  firstimage?: string;
  firstimage2?: string;
  mapx: string;
  mapy: string;
  createdtime?: string;
  modifiedtime?: string;
}

/**
 * 관광지 운영 정보 (detailIntro2 응답)
 * 타입별로 필드가 다르므로 선택적 필드로 정의
 */
export interface TourIntro {
  contentid: string;
  contenttypeid: string;
  // 공통 필드
  infocenter?: string; // 문의처
  restdate?: string; // 휴무일
  usetime?: string; // 이용시간
  parking?: string; // 주차 가능
  chkpet?: string; // 반려동물 동반
  // 관광지(12) 관련
  heritage1?: string;
  heritage2?: string;
  heritage3?: string;
  // 문화시설(14) 관련
  usefee?: string; // 이용요금
  discountinfo?: string; // 할인정보
  // 축제/행사(15) 관련
  eventstartdate?: string; // 행사 시작일
  eventenddate?: string; // 행사 종료일
  eventplace?: string; // 행사 장소
  // 숙박(32) 관련
  roomcount?: string; // 객실 수
  roomtype?: string; // 객실 유형
  // 음식점(39) 관련
  treatmenu?: string; // 대표 메뉴
  // 기타
  [key: string]: string | undefined;
}

/**
 * 관광지 이미지 (detailImage2 응답)
 */
export interface TourImage {
  contentid: string;
  imagename?: string; // 이미지명
  originimgurl?: string; // 원본 이미지 URL
  smallimageurl?: string; // 썸네일 이미지 URL
  serialnum?: string; // 이미지 순번
}

/**
 * 반려동물 동반 여행 정보 (detailPetTour2 응답)
 */
export interface PetTourInfo {
  contentid: string;
  contenttypeid: string;
  chkpetleash?: string; // 애완동물 동반 여부
  chkpetsize?: string; // 애완동물 크기
  chkpetplace?: string; // 입장 가능 장소
  chkpetfee?: string; // 추가 요금
  petinfo?: string; // 기타 반려동물 정보
  parking?: string; // 주차장 정보
}

/**
 * 지역 코드 정보 (areaCode2 응답)
 */
export interface AreaCode {
  code: string; // 지역코드
  name: string; // 지역명
}

/**
 * 관광 타입 정보
 */
export interface ContentType {
  id: string; // 타입 ID
  name: string; // 타입명
}

/**
 * 관광 타입 상수
 */
export const CONTENT_TYPES: ContentType[] = [
  { id: "12", name: "관광지" },
  { id: "14", name: "문화시설" },
  { id: "15", name: "축제/행사" },
  { id: "25", name: "여행코스" },
  { id: "28", name: "레포츠" },
  { id: "32", name: "숙박" },
  { id: "38", name: "쇼핑" },
  { id: "39", name: "음식점" },
];

/**
 * API 응답 래퍼 타입
 */
export interface TourApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items?: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * 좌표 변환 유틸리티
 *
 * 한국관광공사 API는 WGS84 좌표(경도 mapx, 위도 mapy)를 문자열 형태로 제공한다.
 * 잘못된 값이 들어오는 것을 대비해 숫자로 변환 후 유효하지 않으면 null을 반환한다.
 */
export function convertCoordinates(
  mapx: string | undefined,
  mapy: string | undefined
): { lng: number; lat: number } | null {
  const lng = typeof mapx === "string" ? parseFloat(mapx) : Number.NaN;
  const lat = typeof mapy === "string" ? parseFloat(mapy) : Number.NaN;

  if (Number.isNaN(lng) || Number.isNaN(lat)) {
    return null;
  }

  return { lng, lat };
}

