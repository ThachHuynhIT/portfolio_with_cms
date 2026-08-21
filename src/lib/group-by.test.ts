import { describe, expect, it } from "vitest";
import { groupBy } from "./group-by";

describe("groupBy", () => {
  it("groups items by the derived key, preserving relative order within each group", () => {
    const items = [
      { name: "a", category: "x" },
      { name: "b", category: "y" },
      { name: "c", category: "x" },
    ];
    const groups = groupBy(items, (item) => item.category);
    expect(groups.get("x")).toEqual([items[0], items[2]]);
    expect(groups.get("y")).toEqual([items[1]]);
  });

  it("orders groups by first occurrence in the input — the min(order) trick for a pre-sorted input", () => {
    const items = [{ category: "b" }, { category: "a" }, { category: "b" }];
    const groups = groupBy(items, (item) => item.category);
    expect(Array.from(groups.keys())).toEqual(["b", "a"]);
  });

  it("does not crash on an empty-string key", () => {
    const items = [{ category: "" }, { category: "real" }];
    const groups = groupBy(items, (item) => item.category);
    expect(groups.get("")).toEqual([{ category: "" }]);
    expect(groups.size).toBe(2);
  });

  it("returns an empty map for an empty input", () => {
    const groups = groupBy(
      [] as { category: string }[],
      (item) => item.category,
    );
    expect(groups.size).toBe(0);
  });
});
