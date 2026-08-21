import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { distance, duration, ease } from "./motion";

const css = readFileSync(
  path.resolve(import.meta.dirname, "../app/globals.css"),
  "utf-8",
);

function toKebabCase(key: string) {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

describe("motion token parity (motion.ts vs globals.css)", () => {
  it("every duration key has a matching --duration-* CSS var", () => {
    for (const key of Object.keys(duration)) {
      const cssVar = `--duration-${toKebabCase(key)}`;
      expect(css, `${cssVar} missing from globals.css`).toMatch(
        new RegExp(`${cssVar}\\s*:`),
      );
    }
  });

  it("every ease key has a matching --ease-* CSS var", () => {
    for (const key of Object.keys(ease)) {
      const cssVar = `--ease-${toKebabCase(key)}`;
      expect(css, `${cssVar} missing from globals.css`).toMatch(
        new RegExp(`${cssVar}\\s*:`),
      );
    }
  });

  it("every distance key has a matching --motion-distance-* CSS var", () => {
    for (const key of Object.keys(distance)) {
      const cssVar = `--motion-distance-${toKebabCase(key)}`;
      expect(css, `${cssVar} missing from globals.css`).toMatch(
        new RegExp(`${cssVar}\\s*:`),
      );
    }
  });
});
