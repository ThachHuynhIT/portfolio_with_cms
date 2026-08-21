// Pinned to en-US + UTC so a rendered date can't drift between build time
// and request time on a server that isn't necessarily in the same locale/TZ
// as a reader's browser (Phase 10 §7).
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  timeZone: "UTC",
});

export function formatDate(date: Date | string): string {
  return DATE_FORMATTER.format(new Date(date));
}

// `end: null` reads as an ongoing entry (e.g. a current job) rather than a
// missing one.
export function formatDateRange(
  start: Date | string,
  end: Date | string | null,
): string {
  const startLabel = MONTH_YEAR_FORMATTER.format(new Date(start));
  if (!end) {
    return `${startLabel} — Present`;
  }
  const endLabel = MONTH_YEAR_FORMATTER.format(new Date(end));
  return `${startLabel} — ${endLabel}`;
}
