import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const GLOBALS_CSS_PATH = path.resolve(
  import.meta.dirname,
  "../app/globals.css",
);
const css = readFileSync(GLOBALS_CSS_PATH, "utf-8");

function extractBlock(selector: string) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) {
    throw new Error(`Selector "${selector}" not found in globals.css`);
  }
  const openBrace = css.indexOf("{", start);
  const closeBrace = css.indexOf("}", openBrace);
  return { start, body: css.slice(openBrace + 1, closeBrace) };
}

function extractVarNames(body: string) {
  return new Set(
    Array.from(body.matchAll(/--([a-zA-Z0-9-]+)\s*:/g), (m) => m[1]),
  );
}

// The fixed list of shadcn-facing variables Button/Input/Select/AlertDialog/
// Sonner etc. depend on. Names must never change; only values may.
const REQUIRED_SHADCN_VARS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
];

const root = extractBlock(":root");
const dark = extractBlock(".dark");
const rootVars = extractVarNames(root.body);
const darkVars = extractVarNames(dark.body);

describe("design tokens contract (globals.css)", () => {
  it("defines every required shadcn variable in :root", () => {
    for (const name of REQUIRED_SHADCN_VARS) {
      expect(rootVars.has(name), `--${name} missing from :root`).toBe(true);
    }
  });

  it("defines every required shadcn variable in .dark", () => {
    for (const name of REQUIRED_SHADCN_VARS) {
      expect(darkVars.has(name), `--${name} missing from .dark`).toBe(true);
    }
  });

  it(":root and .dark declare the same set of keys, except --radius", () => {
    const rootOnly = [...rootVars].filter(
      (name) => name !== "radius" && !darkVars.has(name),
    );
    const darkOnly = [...darkVars].filter((name) => !rootVars.has(name));

    expect(rootOnly, "keys in :root but missing from .dark").toEqual([]);
    expect(darkOnly, "keys in .dark but missing from :root").toEqual([]);
  });

  it(".dark block appears after :root block in the file", () => {
    expect(dark.start).toBeGreaterThan(root.start);
  });

  it("uses oklch exclusively — no hex, rgb(), or hsl() colors", () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).not.toMatch(/\b(rgb|hsl)a?\(/);
  });
});
