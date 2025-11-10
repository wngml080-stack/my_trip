/**
 * @file sort.ts
 * @description 관광지 목록 정렬 및 선택 보조 유틸리티
 */

import type { TourItem } from "@/lib/types/tour";

export type SortOrder = "latest" | "name";

const DEFAULT_MODIFIED_TIME = "00000000000000";

function getModifiedTime(tour: TourItem): string {
  return tour.modifiedtime || DEFAULT_MODIFIED_TIME;
}

function compareLatest(a: TourItem, b: TourItem): number {
  return getModifiedTime(b).localeCompare(getModifiedTime(a));
}

function compareName(a: TourItem, b: TourItem): number {
  return a.title.localeCompare(b.title, "ko");
}

/**
 * 관광지 목록을 정렬합니다.
 */
export function sortTours(tours: TourItem[], order: SortOrder): TourItem[] {
  const copy = [...tours];

  copy.sort((a, b) => {
    if (order === "name") {
      return compareName(a, b);
    }
    return compareLatest(a, b);
  });

  return copy;
}

/**
 * 기존 관광지와 새로 가져온 관광지를 병합합니다.
 * 동일한 contentid가 있으면 최신 항목으로 덮어씁니다.
 */
export function mergeTours(
  existing: TourItem[],
  incoming: TourItem[]
): TourItem[] {
  const map = new Map<string, TourItem>();

  existing.forEach((tour) => {
    map.set(tour.contentid, tour);
  });

  incoming.forEach((tour) => {
    map.set(tour.contentid, tour);
  });

  return Array.from(map.values());
}

/**
 * 관광지를 병합 후 정렬합니다.
 */
export function mergeAndSortTours(
  existing: TourItem[],
  incoming: TourItem[],
  order: SortOrder
): TourItem[] {
  const merged = mergeTours(existing, incoming);
  return sortTours(merged, order);
}

/**
 * 선택된 관광지 ID를 결정합니다.
 */
export function getNextSelectedTourId(
  sortedTours: TourItem[],
  previousSelectedId?: string
): string | undefined {
  if (
    previousSelectedId &&
    sortedTours.some((tour) => tour.contentid === previousSelectedId)
  ) {
    return previousSelectedId;
  }

  return sortedTours[0]?.contentid;
}

/**
 * 두 관광지 배열의 순서가 동일한지 확인합니다.
 */
export function isSameOrder(a: TourItem[], b: TourItem[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((tour, index) => tour.contentid === b[index]?.contentid);
}

