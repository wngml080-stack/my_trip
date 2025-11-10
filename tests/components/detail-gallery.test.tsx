import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DetailGallery } from "@/components/tour-detail/detail-gallery";
import type { TourImage } from "@/lib/types/tour";

const mockImages: TourImage[] = [
  {
    contentid: "1",
    imagename: "대표 이미지",
    originimgurl: "https://example.com/1.jpg",
    smallimageurl: "https://example.com/1-thumb.jpg",
  },
  {
    contentid: "1",
    imagename: "둘째 이미지",
    originimgurl: "https://example.com/2.jpg",
    smallimageurl: "https://example.com/2-thumb.jpg",
  },
  {
    contentid: "1",
    imagename: "셋째 이미지",
    originimgurl: "https://example.com/3.jpg",
    smallimageurl: "https://example.com/3-thumb.jpg",
  },
];

describe("DetailGallery", () => {
  it("renders fallback when no images are provided", () => {
    render(<DetailGallery images={[]} />);

    expect(
      screen.getByText(/이미지를 준비 중이에요/i)
    ).toBeInTheDocument();
  });

  it("changes active image when thumbnail is clicked", async () => {
    const user = userEvent.setup();
    render(<DetailGallery images={mockImages} />);

    const secondThumbnail = screen.getByRole("button", {
      name: /둘째 이미지 썸네일/i,
    });
    await user.click(secondThumbnail);

    // 대표 이미지 영역에서 "둘째 이미지"를 찾음 (썸네일과 구분)
    // getAllByAltText를 사용하여 첫 번째 요소(대표 이미지)를 선택
    const mainImages = screen.getAllByAltText(/둘째 이미지/i);
    const mainImage = mainImages.find(
      (img) => img.getAttribute("sizes") === "(max-width: 768px) 100vw, 75vw"
    );
    expect(mainImage).toBeInTheDocument();
  });

  it("opens modal and navigates through images", async () => {
    const user = userEvent.setup();
    render(<DetailGallery images={mockImages} />);

    const openButton = screen.getByRole("button", { name: /전체보기/i });
    await user.click(openButton);

    const dialog = await screen.findByRole("dialog", {
      name: /이미지 전체 보기/i,
    });
    expect(dialog).toBeInTheDocument();

    const nextButton = within(dialog).getByRole("button", {
      name: /다음 이미지/i,
    });
    await user.click(nextButton);

    expect(
      within(dialog).getAllByAltText(/둘째 이미지/i)[0]
    ).toBeInTheDocument();

    const closeButton = within(dialog).getByRole("button", { name: /닫기/i });
    await user.click(closeButton);

    expect(
      screen.queryByRole("dialog", { name: /이미지 전체 보기/i })
    ).not.toBeInTheDocument();
  });
});

