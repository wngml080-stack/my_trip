import { describe, expect, it } from "vitest";
import type { TourItem } from "@/lib/types/tour";
import {
  getNextSelectedTourId,
  isSameOrder,
  mergeAndSortTours,
  sortTours,
  type SortOrder,
} from "@/lib/tour/sort";

const baseTours: TourItem[] = [
  {
    contentid: "100",
    title: "서울숲",
    addr1: "서울특별시 성동구",
    areacode: "1",
    contenttypeid: "12",
    mapx: "1271234500",
    mapy: "374567800",
    modifiedtime: "20241101093000",
  },
  {
    contentid: "200",
    title: "남산타워",
    addr1: "서울특별시 중구",
    areacode: "1",
    contenttypeid: "12",
    mapx: "1269876500",
    mapy: "374652100",
    modifiedtime: "20241015091500",
  },
  {
    contentid: "300",
    title: "광안리 해수욕장",
    addr1: "부산광역시 수영구",
    areacode: "6",
    contenttypeid: "12",
    mapx: "1291150000",
    mapy: "352150000",
    modifiedtime: "20241225080000",
  },
];

describe("sortTours", () => {
  const getIds = (items: TourItem[]) => items.map((item) => item.contentid);

  it.each<[SortOrder, string[]]>([
    [
      "latest",
      ["300", "100", "200"], // modifiedtime 내림차순
    ],
    [
      "name",
      ["300", "200", "100"], // 가나다 순 (광안리 → 남산타워 → 서울숲)
    ],
  ])("should sort tours by %s order", (order, expected) => {
    const sorted = sortTours(baseTours, order);
    expect(getIds(sorted)).toEqual(expected);
  });

  it("should not mutate the original array", () => {
    const originalCopy = [...baseTours];
    sortTours(baseTours, "latest");
    expect(baseTours).toEqual(originalCopy);
  });
});

describe("mergeAndSortTours", () => {
  it("should merge without duplicates and keep latest items first", () => {
    const merged = mergeAndSortTours(
      [baseTours[0]],
      [
        baseTours[2],
        {
          ...baseTours[0],
          modifiedtime: "20250101010101",
        },
      ],
      "latest"
    );

    expect(merged).toHaveLength(2);
    // "latest" 정렬: modifiedtime이 더 최신인 항목이 먼저
    // "100"의 modifiedtime "20250101010101"이 "300"의 "20241225080000"보다 최신이므로 첫 번째
    expect(merged[0].contentid).toBe("100");
    expect(merged[0].modifiedtime).toBe("20250101010101");
    expect(merged[1].contentid).toBe("300");
    expect(merged[1].modifiedtime).toBe("20241225080000");
  });
});

describe("getNextSelectedTourId", () => {
  const sortedLatest = sortTours(baseTours, "latest");

  it("should keep previous selection when it still exists", () => {
    const next = getNextSelectedTourId(sortedLatest, "200");
    expect(next).toBe("200");
  });

  it("should fallback to the first item when previous selection is missing", () => {
    const next = getNextSelectedTourId(sortedLatest, "999");
    expect(next).toBe("300");
  });

  it("should return undefined when list is empty", () => {
    const next = getNextSelectedTourId([], "200");
    expect(next).toBeUndefined();
  });
});

describe("isSameOrder", () => {
  it("should detect identical ordering", () => {
    const sorted = sortTours(baseTours, "name");
    expect(isSameOrder(sorted, [...sorted])).toBe(true);
  });

  it("should return false when order differs", () => {
    const latestOrder = sortTours(baseTours, "latest");
    const nameOrder = sortTours(baseTours, "name");
    expect(isSameOrder(latestOrder, nameOrder)).toBe(false);
  });
});

