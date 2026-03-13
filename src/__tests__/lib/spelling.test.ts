import { describe, it, expect } from "vitest";
import { checkSpelling } from "@/lib/utils";

describe("checkSpelling", () => {
  it("returns true for an exact match", () => {
    expect(checkSpelling("elephant", "elephant")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(checkSpelling("Elephant", "elephant")).toBe(true);
    expect(checkSpelling("ELEPHANT", "elephant")).toBe(true);
    expect(checkSpelling("elephant", "Elephant")).toBe(true);
  });

  it("trims leading and trailing whitespace before comparing", () => {
    expect(checkSpelling("  elephant  ", "elephant")).toBe(true);
    expect(checkSpelling("elephant", "  elephant  ")).toBe(true);
    expect(checkSpelling("  Elephant  ", "elephant")).toBe(true);
  });

  it("returns false for a wrong answer", () => {
    expect(checkSpelling("elefant", "elephant")).toBe(false);
    expect(checkSpelling("elephantt", "elephant")).toBe(false);
    expect(checkSpelling("ephant", "elephant")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(checkSpelling("", "elephant")).toBe(false);
  });

  it("returns false when both strings are empty", () => {
    expect(checkSpelling("", "")).toBe(false);
  });
});
