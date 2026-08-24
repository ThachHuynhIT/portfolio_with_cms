import { describe, expect, it } from "vitest";
import { isNavLinkActive } from "./admin-nav-links";

describe("isNavLinkActive", () => {
  it("marks the dashboard link active only on the exact /admin route", () => {
    expect(isNavLinkActive("/admin", "/admin")).toBe(true);
    expect(isNavLinkActive("/admin/skills", "/admin")).toBe(false);
  });

  it("marks a model link active on its own list route", () => {
    expect(isNavLinkActive("/admin/skills", "/admin/skills")).toBe(true);
  });

  it("marks a model link active on nested new/edit routes", () => {
    expect(isNavLinkActive("/admin/skills/new", "/admin/skills")).toBe(true);
    expect(isNavLinkActive("/admin/skills/abc123/edit", "/admin/skills")).toBe(
      true,
    );
  });

  it("does not match a different route that merely shares a prefix", () => {
    expect(isNavLinkActive("/admin/skills-archive", "/admin/skills")).toBe(
      false,
    );
  });

  it("does not match an unrelated route", () => {
    expect(isNavLinkActive("/admin/settings", "/admin/skills")).toBe(false);
  });
});
