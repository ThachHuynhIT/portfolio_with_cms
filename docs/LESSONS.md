# Lessons Learned

Reusable knowledge from this project, for future projects. Not a changelog — see
`docs/CHANGELOG.md` for "what happened." This file answers "what did I learn and how do I
reuse it." No generic knowledge that wasn't actually applied here.

---

# FE Lessons

## Centralize draft/published filtering in one query layer, not per-page

### Context
Public pages (home, about, projects, blog) all need to show only `PUBLISHED` content and
hide `DRAFT` rows, across multiple models (`Project`, `BlogPost`, `Testimonial`).

### Problem
If each page/component calls `prisma.project.findMany()` directly with its own `where`
clause, it's easy for a future page (or a careless edit) to forget the status filter and
leak draft content publicly.

### Approach
Created `src/lib/queries.ts` as the *only* place public code queries these models. Every
exported function already bakes in `where: { status: "PUBLISHED" }` (a shared `published`
const spread into each query). Pages import `getPublishedProjects()`, never `prisma.project`
directly.

### Why
Moves the "is this safe to show publicly" decision from "every call site must remember" to
"this one file guarantees it." A code reviewer only needs to check one file to audit
draft-leak risk.

### Takeaway
Whenever a model has a visibility/status flag that must never leak, put the enforcement in
a single query-layer module and treat direct ORM calls to that model outside that module as
a code-review flag — in any project with the same access-control shape (draft/published,
tenant-scoped rows, soft-delete), not just this one.

### Common Mistakes
Adding a new public page and querying Prisma directly "just this once" because the query
layer doesn't have the exact shape needed yet — extend the query layer instead.

---

## Dedup per-request duplicate fetches with React's `cache()`

### Context
Both the root layout (for nav/site name) and the home page called `getSiteSettings()`
independently in the same request.

### Problem
Without dedup, that's 2 separate DB round-trips for the same singleton row on every page
load, purely because two components in the same render tree both need the same data.

### Approach
Wrapped the fetcher in React's `cache()`: `export const getSiteSettings = cache(function
getSiteSettings() { ... })`. Within a single request, repeated calls return the same
promise/result instead of re-querying.

### Why
`cache()` is scoped per-request in Server Components — exactly matches "same data needed by
multiple components in one render," without needing a manual request-scoped cache or lifting
the fetch up and passing props through everything that needs it.

### Takeaway
Any time a Server Component data-fetcher is called from more than one place in the same
route tree (layout + page, or multiple sibling components), wrap it in `cache()` by default
rather than waiting to notice the duplicate-query symptom.

### Common Mistakes
Solving this by lifting the fetch into the layout and prop-drilling — works, but couples
unrelated components through props just to avoid a duplicate query; `cache()` avoids that
coupling entirely.

---

## A silently-wrong CSS variable reference degrades gracefully — verify it explicitly

### Context
`globals.css` set `--font-sans` to reference itself instead of `--font-geist-sans`. No
build error, no console warning — the browser just fell back to a generic serif font.

### Problem
This kind of bug produces a plausible-but-wrong result (a font renders, just not the
intended one), so it's invisible unless someone is specifically looking for it — it doesn't
throw, doesn't fail a type check, doesn't fail a build.

### Approach
Caught during an unrelated UI pass (Phase 2 SCSS conversion), by visually comparing the
rendered font against the intended design.

### Why
Type checking and build success only prove the code is *syntactically* wired up, not that
CSS custom properties resolve to the values you think they do.

### Takeaway
For any custom-property/token indirection (CSS vars, theme tokens, Sass maps), do a visual
check after wiring it up, not just a build check — self-referencing variables and typo'd
token names are a silent-fallback failure mode that automated checks won't catch.

---

# BE Lessons

*(No backend/API lessons yet — Phase 1/2 only covered the public read path. Revisit once
auth, CRUD, and the contact-form email flow are built.)*

---

# DB Lessons

## Prisma 7 requires an explicit driver adapter — pick one that matches your DB host, not just the DB engine

### Context
Prisma 7 removed the bundled query-engine binary; every project must supply a driver
adapter explicitly.

### Problem
Naively picking "the Postgres adapter" isn't a single choice — there's a plain `pg`-based
adapter and serverless/edge-specific ones (e.g. for Neon's serverless driver), and they have
different connection-pooling assumptions.

### Approach
Chose `@prisma/adapter-pg` (backed by the `pg` package) since this app runs as a normal
Node server, and pairs it with Neon's *pooled* connection string (see the Neon lesson
below) rather than reaching for a serverless-specific adapter.

### Why
The adapter's job is to open connections the way your runtime actually works; a
serverless-optimized adapter solves a problem (cold-start connection churn) this project
doesn't have, since it's not deployed as edge/serverless functions.

### Takeaway
When picking a Prisma 7 driver adapter, decide based on *how the app is hosted/runs*
(long-lived Node server vs. serverless/edge functions), not just "which DB engine." Revisit
the choice if the hosting model changes.

### Common Mistakes
Assuming any Postgres-flavored adapter is interchangeable — connection lifecycle
assumptions differ and picking the wrong one causes exactly the symptom in the next lesson.

---

## Neon: use the pooled endpoint for app traffic; the direct endpoint has a low concurrent-connection ceiling

### Context
Server Components fetching data in parallel (`Promise.all` across sibling components/pages)
opened multiple concurrent DB connections per request.

### Problem
Neon's *direct* connection endpoint has a low concurrent-connection limit. Parallel
server-side fetches exhausted it, causing connection failures under normal page-load
concurrency, not just under heavy load.

### Approach
Switched `DATABASE_URL` to Neon's pooled endpoint (hostname suffix `-pooler`), which fronts
connections through PgBouncer-style pooling designed for exactly this many-short-lived-
connections pattern. This project uses a single `DATABASE_URL` for both app queries and
Prisma Migrate — no separate direct/migration URL is configured.

### Why
Server Components + `Promise.all` is an idiomatic Next.js pattern, not a mistake — the
fix belongs on the connection-string side (match the endpoint to the concurrency pattern),
not by artificially serializing fetches to work around a direct connection's limit.

### Takeaway
With Neon (or any pooled-Postgres-as-a-service) and Next.js Server Components, default to
the pooled connection string from the start — don't wait to hit the direct endpoint's
connection ceiling first. If a project later needs a separate long-lived/direct connection
(e.g. for `LISTEN/NOTIFY` or long transactions), that's a deliberate second connection
string, not the default.

### Common Mistakes
Reaching for the direct endpoint because it "sounds simpler" or is the first example in
Neon's docs — for a Next.js app with concurrent server-side reads, pooled should be the
default choice, not a fallback after hitting a limit.

---

## Model a singleton config row with a fixed, hardcoded primary key

### Context
`SiteSettings` needs exactly one row (site name, tagline, bio, hero copy, SEO defaults).

### Problem
A normal auto-generated ID (`cuid()`/`uuid()`) makes "there is exactly one row and I know
how to fetch it" awkward — you'd need a separate "find the first/only row" query, and
nothing prevents a second row from being created.

### Approach
`id String @id @default("singleton")` — the primary key's default value is the literal
string `"singleton"`. Fetching is always `findUnique({ where: { id: "singleton" } })`, and
creating a second row requires deliberately passing a different `id`.

### Why
Turns "there should be exactly one row" from a convention enforced by query discipline into
something closer to structurally true — the natural key communicates intent and makes the
fetch a plain unique lookup instead of `findFirst()` + hope.

### Takeaway
For any config/settings table that should always have exactly one row, use a hardcoded
literal default for the primary key instead of an auto-generated one — same pattern applies
to any "global singleton" table in future projects.

---

# Dev Workflow Lessons

## `.agents/skills/` is the tracked source of truth; `.claude/skills/` and `.windsurf/skills/` are gitignored local symlinks

### Context
`prisma init` (Prisma 7+) installs shared AI-agent skill docs into `.agents/skills/` plus a
`skills-lock.json`. Claude Code and Windsurf each expect skills under their own
tool-specific directory.

### Problem
This repo's git has `core.symlinks=false` (typical on Windows without Developer Mode
enabled), so `git add` on a symlinked directory doesn't store a symlink — it walks through
and stores full duplicate copies of every file. Committing `.claude/skills/` and
`.windsurf/skills/` as real symlinked-through directories would triple-track identical
content for no benefit.

### Approach
Kept `.agents/skills/` as the only tracked copy; `.claude/skills/` and `.windsurf/skills/`
are real symlinks on disk (created by `prisma init`) but explicitly gitignored.

### Why
Any tool that resolves the symlinks locally already sees the same content via
`.agents/skills/` — there's no functional gap, only a git-bookkeeping one, and the fix
(gitignore) is cheaper than the alternative (accept tripled repo size on every skill
update).

### Takeaway
On Windows repos without symlink support enabled in git, treat any tool-convention symlink
directory the same way: verify with `git check-attr`/`git config core.symlinks` whether git
will actually store a symlink or dereference it, and gitignore the dereferencing side rather
than commit duplicated content. If the directories are ever missing after a fresh clone,
that's expected — recreate via `prisma init` or a manual symlink, don't "fix" it by copying
real files in.

---

## Branch-per-phase with a fixed structure keeps `/clear`-recoverable context cheap

### Context
Each development phase (foundation scaffold, Prisma+seed+public pages, UI pass) got its own
`feature/phase<N>-<short-name>` branch off `develop`, merged back with a merge commit
(not squashed, not rebased).

### Approach
One branch = one phase = one entry in `docs/CHANGELOG.md`. Merge commits stay as merge
commits, so `git log --graph` directly mirrors the phase structure.

### Why
Because the branch/merge structure already encodes "what phase did this belong to," writing
the changelog entry is a lookup (`git show <merge-commit> --stat`, `git log
<branch>..develop`) rather than a reconstruction from scratch — and future `/clear` recovery
can cross-reference "which phase am I resuming" against both the changelog and `git log`
without them disagreeing.

### Takeaway
When phases are also branches with merge commits, keep it that way rather than switching to
squash-merge or rebase — the git graph becomes a second, independently-verifiable source for
the changelog's phase boundaries.

---

## How to add lessons

When asked to "Record lessons": only add a lesson that reflects something actually applied
or decided in this project (not generic knowledge), and check this file first to avoid
duplicating an existing entry — extend an existing lesson's Takeaway/Common Mistakes instead
of creating a near-duplicate.
