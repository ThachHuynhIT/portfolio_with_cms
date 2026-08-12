# Project Changelog

Purpose: restore project context quickly after `/clear`. Organized by phase/milestone.
Only decisions, problems, and state that aren't already derivable from git log / current
code / `CLAUDE.md`+`AGENTS.md`. Never contains secrets — see `.env.example` for the shape
of required env vars, never real values here.

---

## Phase 0 — Foundation scaffold

- **Date:** 2026-08-10
- **Branch:** `main` → `chore/project-conventions` → `develop`
- **Commits:** `8067bef` (initial), `c0183ac` (scaffold), `f911eab`, `a98d0f0`, merge `ee608c4`

**Changes**
- Scaffolded Next.js 16 App Router + shadcn/ui (Tailwind) + Auth.js (`next-auth@5.0.0-beta.32`).
- Full Prisma schema authored up front for all planned models: `AdminUser`, `SiteSettings`
  (singleton row, id always `"singleton"`), `Skill`, `ExperienceEntry`, `Project`, `BlogPost`,
  `Testimonial`, `ContactMessage`. See `prisma/schema.prisma` for current definitions.
- Established repo conventions later documented in `CLAUDE.md`: SCSS Modules as default
  styling, Tailwind reserved for shadcn/ui + one-off utilities, path aliases `@/*`,
  `@components/*`, `@lib/*`, `@styles/*` (no domain aliases like `@projects/*` until a real
  `src/modules/<domain>/` exists).

**Important decisions**
- **Prisma 7 + `@prisma/adapter-pg`**: Prisma 7 requires an explicit driver adapter (no
  built-in query engine binary). Chose `@prisma/adapter-pg` (`pg` driver) over other
  adapters — plain Postgres, no serverless-specific driver needed since Neon's pooled
  endpoint (see Phase 1) already handles pooling. Wiring is in `src/lib/prisma.ts`.
- **Prisma Client generated to `src/generated/prisma`** (not `node_modules/.prisma`), per
  the `prisma-client` generator provider — see `generator client` block in
  `prisma/schema.prisma`.
- Path aliases deliberately scoped to directories that already have real content — see
  `CLAUDE.md` "Module aliases" table for the rationale (not repeated here).

**Problems encountered**
- `globals.css` had `--font-sans` referencing itself instead of `--font-geist-sans`,
  silently falling back to a serif font. Not caught until Phase 2 (see below) since Tailwind
  defaults masked it visually early on.

**Current state:** App Router structure, schema, and styling/alias conventions in place.
No database connection, auth flow, or CRUD logic yet.

**Remaining work at end of phase:** DB provisioning, migrations, seed data, real public pages.

---

## Phase 1 — Prisma + Neon + public pages (read path)

- **Date:** 2026-08-10
- **Branch:** `feature/phase1-prisma-seed-public-pages` → `develop`
- **Commits:** `e7aa137` (feature), `a8814df` (docs fix), merge `97231e8`

**Changes**
- First migration `prisma/migrations/20260810084559_init`.
- `prisma/seed.ts`: seeds 2 published + 1 draft project, 2 blog posts, skills, experience
  entries, testimonials, site settings, and one `AdminUser` (from `ADMIN_EMAIL`/
  `ADMIN_PASSWORD` env vars — never real credentials in the seed file itself).
- `src/lib/queries.ts` introduced as the **single enforcement point** for
  published/draft filtering — all public-facing reads (`getPublishedProjects`,
  `getProjectBySlug`, `getPublishedBlogPosts`, `getBlogPostBySlug`, etc.) filter on
  `status: "PUBLISHED"` here. Public pages must go through this module, not raw
  `prisma.*` calls, to keep draft-hiding centralized in one place.
- Replaced the static placeholder home page with real routes reading from Postgres:
  home, about, projects (+ `[slug]`), blog (+ `[slug]`), all under `src/app/(public)/`.
- Verified manually: draft project/post return 404 on public detail routes and are absent
  from list pages.

**Important decisions**
- Filtering logic lives in `queries.ts`, not per-page — prevents a future page from
  accidentally leaking draft content by querying Prisma directly.
- Scope explicitly excluded from this phase: admin UI, auth, Cloudinary, Resend, markdown
  rendering, SEO, UI polish. Kept the phase to "public read path works end-to-end."

**Problems encountered → root cause → solution**
- **Problem:** concurrent DB queries (`Promise.all` across server components) failed.
  **Root cause:** Neon's *direct* (non-pooled) endpoint has a low concurrent-connection
  limit, easily exhausted by Next.js server components fetching in parallel.
  **Solution:** switched `.env.example`'s `DATABASE_URL` example to the pooled endpoint
  (hostname ends in `-pooler`). Only one connection string is used — no separate
  `DIRECT_URL`/migration-time URL is configured in this project (`prisma.config.ts` reads
  a single `DATABASE_URL`).

**Current state:** Public read path fully wired to Postgres (Neon) through
`src/lib/queries.ts`. No admin/auth/CMS write path yet.

**Remaining work:** Admin auth (Auth.js), CRUD for content models, image upload
(Cloudinary), contact form + email (Resend), markdown rendering, SEO metadata.

**Key files:** `src/lib/prisma.ts` (client + adapter), `src/lib/queries.ts` (read/filter
layer), `prisma/seed.ts`, `.env.example` (env var shapes — real values in untracked `.env`).

---

## Phase 2 — Public pages UI pass (SCSS Modules + dark theme)

- **Date:** 2026-08-10
- **Branch:** `feature/phase2-ui-design-pass` → `develop`
- **Commits:** `ccffe1c`, merge `8b8002b`

**Changes**
- Converted all 6 public pages from Tailwind utility classes to colocated
  `page.module.scss` files, per the SCSS Modules convention established in Phase 0.
- Added shared tokens/mixins to `src/styles/_variables.scss` / `_mixins.scss`: typography
  scale, `page-container`, `section-stack`, card/card-link, pill, button-pill.
- Added an accent color and made **dark the default theme**.
- Split site nav into a Client Component (`src/components/public/site-nav.tsx`) with
  brand link and active-link state (`aria-current`).
- Fixed the Phase 0 `--font-sans` self-reference bug in `globals.css` (was falling back to
  serif silently).
- Wrapped `getSiteSettings()` in React's `cache()` (in `src/lib/queries.ts`) since both
  the root layout and the home page call it per request — avoids duplicate DB round-trips.

**Important decisions**
- This conversion covers **only** the Phase 1 public pages. Phase 0's shadcn/ui setup
  intentionally remains Tailwind — documented as known tech debt in `CLAUDE.md`, not
  reverted here. Do not treat shadcn/ui components as candidates for SCSS conversion
  without a separate decision.

**Current state:** All public pages use SCSS Modules with dark theme; shadcn/ui portion of
the codebase is untouched (still Tailwind, by design).

**Remaining work:** Admin UI (will need its own styling decision — likely SCSS Modules per
convention, but not yet built), auth, CRUD, uploads, contact form, SEO.

---

## How to update this file

When asked to "Update change log": review changes since the last entry (git log/diff +
conversation), append or amend the current phase's entry — don't rewrite the whole file
unless correcting a factual error.
