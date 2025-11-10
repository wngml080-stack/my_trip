import { describe, expect, it } from "vitest";
import { convertCoordinates } from "@/lib/types/tour";

describe("convertCoordinates", () => {
  it("should convert string WGS84 coordinates to numbers", () => {
    const coords = convertCoordinates("129.042345", "35.1795543");
    expect(coords).not.toBeNull();
    expect(coords?.lng).toBeCloseTo(129.042345);
    expect(coords?.lat).toBeCloseTo(35.1795543);
  });

  it("should handle integer-like strings", () => {
    const coords = convertCoordinates("126", "37");
    expect(coords).not.toBeNull();
    expect(coords?.lng).toBe(126);
    expect(coords?.lat).toBe(37);
  });

  it("should return null when values are missing", () => {
    expect(convertCoordinates(undefined, "35.179")).toBeNull();
    expect(convertCoordinates("129.04", undefined)).toBeNull();
  });

  it("should return null for non-numeric input", () => {
    expect(convertCoordinates("abc", "35.179")).toBeNull();
    expect(convertCoordinates("129.04", "NaN")).toBeNull();
  });
});

