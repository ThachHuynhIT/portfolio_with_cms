import { describe, expect, it } from "vitest";
import { formatDate, formatDateRange } from "./format-date";

describe("formatDate", () => {
  it("formats a Date in en-US, UTC", () => {
    expect(formatDate(new Date("2026-03-05T00:00:00Z"))).toBe("March 5, 2026");
  });

  it("formats an ISO date string the same way", () => {
    expect(formatDate("2026-03-05T00:00:00Z")).toBe("March 5, 2026");
  });

  it("doesn't roll over to the previous day for a UTC midnight timestamp", () => {
    // The exact bug a locale-default (non-UTC) formatter would introduce on
    // a server running in a negative-offset timezone.
    expect(formatDate(new Date("2026-01-01T00:00:00Z"))).toBe(
      "January 1, 2026",
    );
  });
});

describe("formatDateRange", () => {
  it("formats a closed range as month/year — month/year", () => {
    expect(
      formatDateRange(
        new Date("2020-06-15T00:00:00Z"),
        new Date("2023-09-01T00:00:00Z"),
      ),
    ).toBe("June 2020 — September 2023");
  });

  it("formats a null end as an ongoing range", () => {
    expect(formatDateRange(new Date("2024-01-10T00:00:00Z"), null)).toBe(
      "January 2024 — Present",
    );
  });

  it("accepts string dates for both ends", () => {
    expect(
      formatDateRange("2020-06-15T00:00:00Z", "2023-09-01T00:00:00Z"),
    ).toBe("June 2020 — September 2023");
  });
});
