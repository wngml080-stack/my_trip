import { afterEach, describe, expect, it, vi } from "vitest";
import { getTourDetail } from "@/lib/api/tour-api";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("tour-api fetch URL", () => {
  it("요청 URL에 이중 슬래시가 포함되지 않아야 한다", async () => {
    const mockResponse = {
      response: {
        header: {
          resultCode: "0000",
          resultMsg: "OK",
        },
        body: {
          items: {
            item: {
              contentid: "2994101",
              contenttypeid: "12",
              title: "테스트 관광지",
              addr1: "서울특별시",
              mapx: "0",
              mapy: "0",
            },
          },
        },
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    global.fetch = fetchMock;

    await getTourDetail("2994101");

    expect(fetchMock).toHaveBeenCalled();
    const [requestedUrl] = fetchMock.mock.calls[0];
    expect(requestedUrl).toBe(
      "http://localhost:3000/api/tour/detailCommon2?MobileOS=ETC&MobileApp=MyTrip&_type=json&contentId=2994101"
    );
  });
});

