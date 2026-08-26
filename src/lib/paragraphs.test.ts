import { describe, expect, it } from "vitest";
import { splitParagraphs } from "./paragraphs";

describe("splitParagraphs", () => {
  it("splits on a blank line", () => {
    expect(splitParagraphs("First paragraph.\n\nSecond paragraph.")).toEqual([
      "First paragraph.",
      "Second paragraph.",
    ]);
  });

  it("treats a blank line with surrounding whitespace as a separator too", () => {
    expect(
      splitParagraphs("First paragraph.\n  \nSecond paragraph."),
    ).toEqual(["First paragraph.", "Second paragraph."]);
  });

  it("trims each paragraph", () => {
    expect(splitParagraphs("  First.  \n\n  Second.  ")).toEqual([
      "First.",
      "Second.",
    ]);
  });

  it("drops empty paragraphs from extra blank lines", () => {
    expect(splitParagraphs("First.\n\n\n\nSecond.")).toEqual([
      "First.",
      "Second.",
    ]);
  });

  it("returns an empty array for an empty string", () => {
    expect(splitParagraphs("")).toEqual([]);
  });

  it("returns a single paragraph unchanged when there's no blank line", () => {
    expect(splitParagraphs("Just one paragraph.")).toEqual([
      "Just one paragraph.",
    ]);
  });
});
