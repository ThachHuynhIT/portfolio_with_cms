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

### Update: the same pooled URL breaks `prisma migrate deploy`'s advisory lock
Vercel production builds started failing intermittently (first seen as early as the
Phase 6 verify merge) with `P1002: Timed out trying to acquire a postgres advisory
lock` during `prisma migrate deploy`. Root cause: PgBouncer transaction-mode pooling
(Neon's pooled endpoint) doesn't reliably keep a session's connection stable across
statements, so the session-scoped advisory lock Prisma Migrate takes before applying
migrations can appear to hang or never be visible to the next statement — a
`deploy`/build script running `prisma migrate deploy` against `DATABASE_URL` hit this
on three separate production deploys (Phase 6, Phase 7, Phase 9), not just once.

Interim fix (in `prisma.config.ts`): set `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1` to skip
the lock check entirely, since this project still has no separate direct/non-pooled
`DIRECT_URL` for migrations. This removes Prisma's own guard against two concurrent
`migrate deploy` runs racing each other — acceptable for now given this project's
single-maintainer, sequential-merge workflow, but not a permanent fix.

**Follow-up (not yet done):** add a Neon direct (non-pooled) `DIRECT_URL`, point
`prisma.config.ts`'s `migrations` block at it (keep `datasource.url` on the pooled
`DATABASE_URL` for app traffic), and remove the `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK`
override.

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

## Verifying a "read-only" MCP role: check the Postgres error code, not just the tool's own guardrail

### Context
Phase 3 added a dedicated `mcp_readonly` Postgres role for the `postgres-readonly` MCP
server (`@yawlabs/postgres-mcp`), with a placeholder `MCP_POSTGRES_READONLY_URL` documented
in `.env.example`. `docs/ROADMAP.md`'s Phase 3 verification checklist requires proving the
role is rejected at the DB permission level, not just by convention.

### Problem
The MCP server wraps every `pg_query` call in `BEGIN READ ONLY` by default and blocks writes
with its own message ("this server is in read-only mode... Set ALLOW_WRITES=1") unless
`ALLOW_WRITES=1` is set in the server's env. A first `INSERT` test against `ContactMessage`
returned exactly that message — which only proves the *tool* has a guardrail, not that the
underlying Postgres role actually lacks `INSERT` privilege. If the role had accidentally been
granted write access, this same test would still report "blocked" and give false confidence.

### Approach
Temporarily set `ALLOW_WRITES=1` in the MCP server's env block (`~/.claude.json` →
`projects["<repo>"].mcpServers.postgres-readonly.env`), reconnected the server via `/mcp`, and
re-ran the identical `INSERT`. The error changed to `permission denied for table
"ContactMessage" (code: 42501)` — Postgres's own `insufficient_privilege` error — confirming
the `mcp_readonly` role itself is revoked at the DB level. Removed `ALLOW_WRITES=1` again
immediately after, restoring the tool's own guardrail as a second layer.

### Why
A tool-level "read-only mode" message and a database-level permission error look similar at a
glance but prove very different things — the first test's own error text even said explicitly
it was a transaction-mode rejection ("cannot execute INSERT in a read-only transaction"), not
a privilege rejection. Stopping there would have marked the verification checklist "done"
without testing the thing it claims to test.

### Takeaway
When a checklist says "verify X is rejected at the DB permission level," don't stop at the
first error message — check whether it's a Postgres error code (e.g. `42501
insufficient_privilege`) or an application/tool-level guard. For any MCP server or client that
wraps queries in its own safety transaction, temporarily disable that wrapper (if it exposes
an escape hatch) to confirm the underlying role's real grants, then re-enable the wrapper
afterward — belt-and-braces means testing each belt and each brace separately, not just the
outermost one.

### Common Mistakes
Reading "this server is in read-only mode" / "cannot execute INSERT in a read-only
transaction" as proof the DB role is read-only — it only proves the MCP tool's own transaction
wrapper caught the write first, before Postgres itself got a chance to.

---

## Personal dev-tooling MCP servers (Context7, Cloudinary, Vercel) — outside Phase 3 scope, kept local-only

### Context
Beyond `docs/ROADMAP.md` Phase 3's scoped Postgres/Neon + GitHub MCP servers, added three more
purely as personal dev-tooling productivity aids: `context7` (up-to-date library docs),
`cloudinary` (asset inspection for the app's own Cloudinary account), `vercel` (deployment/build
log lookup). None of these are part of the Phase 3 curriculum — Phase 3 explicitly lists "thêm
SaaS/service mới không có lý do cụ thể" as out of scope, so this is recorded separately rather
than folded into that section.

### Problem
The requirement going in was "no MCP server should require signing into a personal account via
an interactive browser OAuth flow" — same spirit as `github`/`postgres-readonly` already using a
static token/connection string, not account login. Each of the three candidate servers turned out
to have a different, non-obvious auth model:
- **Context7**: default remote endpoint (`mcp.context7.com/mcp`) connects with no auth at all
  (anonymous, lower rate limit); an optional `CONTEXT7_API_KEY` header raises the limit without
  any browser step.
- **Cloudinary**: the connector offered by default (`asset-management.mcp.cloudinary.com`, SSE)
  is OAuth-only. A separate official local package, `@cloudinary/asset-management-mcp`, runs via
  `npx` (stdio) and authenticates with a plain `CLOUDINARY_URL` built from the same
  `CLOUDINARY_CLOUD_NAME`/`API_KEY`/`API_SECRET` this app already uses for uploads — no OAuth.
- **Vercel**: the hosted `mcp.vercel.com` endpoint is OAuth-only *by design*, confirmed in
  Vercel's own docs ("requires an OAuth consent screen on every connection"). A generated
  `VERCEL_TOKEN` (personal access token) was tried as a static `Authorization: Bearer` header
  first — it failed with a confusing `503 temporarily_unavailable` (the endpoint was trying to
  introspect it as an OAuth token, not accept it as a bearer credential). There is no local-only
  alternative for Vercel; OAuth was accepted as a deliberate one-off exception.

### Approach
Configured all three at **local scope** (`claude mcp add -s local`, private to this machine, not
`.mcp.json`, nothing git-tracked): `context7` with the API-key header; `cloudinary` re-pointed
from the remote SSE server to the local stdio package; `vercel` left on OAuth after confirming
(via Vercel's docs, not guesswork) that no static-token path exists. The unused `VERCEL_TOKEN`
env var was removed from `.env` rather than kept around as dead config.

### Why
"Requires OAuth" isn't a uniform property of remote MCP servers — some (Context7) don't require
any auth by default, some (Cloudinary) have a non-OAuth server variant if you look for the local
package instead of the first-listed remote one, and some (Vercel) are OAuth-only as an explicit
platform decision with no workaround. Treating all three the same (e.g. assuming a bearer-token
header always works, or assuming OAuth is always avoidable) would have produced either a
misconfigured server or a false belief that a workaround exists.

### Takeaway
Before adding any new MCP server, check its actual auth model per-server rather than assuming —
official docs beat guessing a header name or endpoint. A "no personal-account login" requirement
is satisfiable for most dev-tooling MCP servers (no-auth default, or a local package keyed by a
credential you already hold), but not universally; some vendors hard-require OAuth by design, and
that's a legitimate reason to either accept the OAuth exception explicitly or drop the server —
not a sign the setup was done wrong.

### Common Mistakes
Trying a static `Authorization: Bearer <token>` header against a remote MCP endpoint without
first confirming the server supports non-OAuth auth — the failure mode (a vague 5xx) can look
like a transient outage rather than "this auth method isn't supported here," wasting a retry
cycle before checking the vendor's docs.

---

## A corrupted git ref blocks every porcelain command that touches it — branch around it via plumbing instead

### Context
Local `refs/heads/develop` had somehow become a loose ref file containing 41 null bytes
instead of a commit SHA, while `origin/develop` was completely healthy. `git status`
reported every tracked file as newly staged, and `git branch -a`/`git log` on `develop`
failed.

### Problem
Every normal fix attempt failed the same way: `git update-ref`, `git update-ref -d`,
`git reset --soft <sha>`, `git checkout -b <name>` (when it needed to update `develop`
itself), and even `git stash` (blocked separately — no initial commit existed locally) all
errored with `cannot lock ref 'refs/heads/develop': unable to resolve reference ...
reference broken`. Git's ref-locking always tries to *read* the existing value first
(for the reflog and safety checks), and a plumbing command has no flag that skips that
read — so a corrupted ref can't be repaired through git commands that target that ref by
name, only by replacing the raw file.

### Approach
Sidestepped `develop` entirely instead of trying to fix it first: built the new branch
directly from `origin/develop` with plumbing that never names the broken ref —
`git write-tree` (snapshot the index), `git commit-tree <tree> -p <origin/develop-sha>
-m "..."` (create the commit object with the right parent), `git update-ref
refs/heads/<new-branch> <new-commit-sha>` (a *new* ref name has no old value to read, so
this succeeds), then `git symbolic-ref HEAD refs/heads/<new-branch>`. Once real work was
safely on its own branch, repaired `develop` itself with a direct file write
(`printf '%s\n' <sha> > .git/refs/heads/develop`) — the only step that *does* need to
touch the corrupted file — and verified with `git for-each-ref`.

### Why
`update-ref`/`reset`/`checkout` all fail on a broken ref because they're designed to
*update relative to the current value*; creating a brand-new ref has no current value to
reconcile, so it's a strictly different code path that doesn't hit the broken read. This
means "can't fix the ref" and "can't get any work done" are separate problems — the second
one is solvable without solving the first.

### Takeaway
When a git ref is corrupted (not just "wrong," but literally unreadable), don't try to
repair it as step one. Check whether the remote's copy of that branch is healthy
(`git ls-remote`/`git for-each-ref refs/remotes`); if so, build new work directly from the
remote ref via `write-tree`/`commit-tree`/`update-ref <new-name>`, which never needs to
read the broken ref, and only attempt the direct file-level repair afterward, once nothing
depends on it succeeding first.

### Common Mistakes
Assuming a broken ref needs `git update-ref -d` (or similar) to "clear" it before anything
else can work — `-d` still tries to resolve the old value and fails identically. Also,
automated/sandboxed environments may block raw writes under `.git/refs/` as a risky
operation regardless of intent — expect to retry, or have a human run the direct file
write, if the first attempt is denied.

---

## `tsc --noEmit` alone can't see Next.js's generated route types — run `next typegen` first

### Context
Phase 5 added a `typecheck` script (`tsc --noEmit`) so CI could catch type errors without a
full `next build`. `tsconfig.json` already lists `.next/types/**/*.ts` in `include`.

### Problem
Running `tsc --noEmit` on a clean checkout (no `.next/` directory yet — e.g. right after
`npm ci` in CI, before any `next build`/`next dev` has run) failed with
`Cannot find name 'PageProps'` / `'LayoutProps'`. These aren't real types anywhere in the
repo — Next.js generates them into `.next/types/` as a *side effect* of `build`/`dev`, and
`tsconfig.json`'s `include` glob only picks up files that already exist on disk.

### Approach
Next.js 16 ships a dedicated command for exactly this: `next typegen` — "Generate TypeScript
definitions for routes, pages, and layouts without running a full build." Changed the script
to `"next typegen && tsc --noEmit"` so the ambient types exist before `tsc` runs, independent
of whether `next build` has ever been run in that checkout.

### Why
A `typecheck` step that only passes *after* `next build` has already run once isn't a
meaningful independent gate — it would silently depend on step ordering or a stale `.next/`
directory left over from a previous run, and would fail unpredictably on a genuinely fresh
checkout (exactly what CI is).

### Takeaway
Whenever a Next.js project's `tsconfig.json` includes `.next/types/**/*.ts`, don't assume
`tsc --noEmit` is self-sufficient — check `next --help` for a `typegen` (or equivalent)
command and run it first, especially before wiring the same script into CI where there's no
leftover `.next/` from local dev to hide the gap.

### Common Mistakes
Testing a new `typecheck` script locally without first deleting `.next/` — a stale build
cache from earlier local work makes the ambient types "just work," masking the fact that a
truly clean checkout (CI's actual starting state) would fail.

---

## rehype plugin order decides whether sanitize can see what a later plugin adds

### Context
Phase 7 added a shared `<Markdown>` component (`react-markdown` + `remark-gfm` +
`rehype-sanitize` + `rehype-highlight`) for `BlogPost.content` and `Project.description`.

### Problem
`rehype-sanitize`'s default schema doesn't allow arbitrary `className` values (e.g.
`hljs-keyword`, `hljs-string`) that `rehype-highlight` adds for syntax highlighting. If
sanitize ran *after* highlight, it would silently strip every highlighting class with no
error — code blocks would render but never be colored.

### Approach
List `rehypeSanitize` before `rehypeHighlight` in `rehypePlugins`. rehype plugins run in
array order, transforming the AST sequentially — sanitize runs first on the raw parsed
tree, then highlight runs after and adds its classes to a tree that is never sanitized
again.

### Why
This ordering is safe specifically because `rehype-highlight`'s output is deterministic,
derived only from code-fence content/language — not from unsanitized user-controlled
markup — so nothing dangerous can enter through it after sanitize has already run.

### Takeaway
When composing `rehype-sanitize` with another rehype plugin, put sanitize first only when
the later plugin's output is trusted/derived rather than user-controlled. If a later
plugin can introduce raw or attacker-influenced markup (e.g. `rehype-raw`), sanitize must
run *after* it instead, or the danger reappears unsanitized in the final tree.

### Common Mistakes
Assuming "sanitize is in the plugin list" is sufficient regardless of position — order
matters as much as presence.

---

## Mock the query layer, not the database, when the invariant lives in application code

### Context
Phase 8 needed a test proving `getPublishedProjects`/`getProjectBySlug` (and the other
`queries.ts` exports) never return `DRAFT` rows, and had to pick between mocking Prisma or
standing up a real test database.

### Problem
A real test DB (Neon test branch, or a Postgres service container in CI) would need new
CI secrets and seed-data upkeep, but the risk this test actually guards against is a future
edit to `queries.ts` dropping the `status: "PUBLISHED"` filter — not whether Postgres
executes `WHERE` correctly.

### Approach
`vi.mock("@/lib/prisma")` in `src/lib/queries.test.ts`, replacing `prisma.project`/
`prisma.blogPost`/`prisma.testimonial` with `vi.fn()` stand-ins, then asserting each query
function calls Prisma with `where` containing `status: "PUBLISHED"`.

### Why
`tsc --noEmit` (already in CI via `typecheck`) already guarantees `status` is a real,
correctly-spelled field on the Prisma model — that class of bug can't reach this test.
What TypeScript *can't* catch is someone deleting the `published` spread from a query
function's `where` clause; asserting on the actual call arguments catches exactly that,
with zero new CI infrastructure.

### Takeaway
When a test's job is "prove this application code still builds the query it claims to,"
mock the ORM client and assert on call arguments — don't reach for a real database unless
the thing under test is the database's own behavior (constraints, cascades, transactions).
Save real-DB tests for invariants that genuinely live in the database, not in a `.ts` file.

### Common Mistakes
Defaulting to "tests should hit a real database for confidence" without asking what
specific regression the test is supposed to catch — that question decides whether mocking
is a shortcut or the actually-correct scope for the test.

---

## Server Actions crossing into a Client Component must be a reference, not a closure

### Context
Phase 9's `Project` create/edit pages are Server Components that render a shared
`<ProjectForm>` Client Component, which needs to call `createProjectAction` (create) or
`updateProjectAction(id, data)` (edit) on submit.

### Problem
The natural-looking code — `<ProjectForm onSubmit={(data) => createProjectAction(data)} />`
in the Server Component — fails at runtime with "Event handlers cannot be passed to
Client Component props." `tsc`, `eslint`, and `vitest` all stayed green; this only
surfaced when the page was actually requested against a running dev server. Wrapping a
Server Action in a plain arrow function makes the *wrapper* — not the Server Action
itself — the thing crossing the server→client boundary, and React only allows a real
Server Action reference (or a value produced by `.bind()` on one) or plain serializable
data to cross that boundary, not an arbitrary closure.

### Approach
Followed the pattern in Next.js's own docs (`app/02-guides/forms.md`, "Passing
additional arguments"): do the `.bind()`/argument-currying *inside* the Client
Component, not in the Server Component that renders it. `ProjectForm` now imports
`createProjectAction`/`updateProjectAction` directly from `./actions` and takes a plain
`projectId?: string` prop (a serializable string, safe to pass down); it picks which
action to call and supplies `id` itself at submit time.

### Why
Only two kinds of things may cross the Server→Client prop boundary: values React can
serialize (strings, numbers, plain objects/arrays) and genuine Server Action references
(functions Next.js's compiler has tagged as such). A closure defined in a Server
Component's module scope is neither — even though it *calls* a Server Action inside,
the closure itself is an ordinary server-side function with no special handling.

### Takeaway
Whenever a Client Component needs a Server Action parameterized by data only the Server
Component has (an id, a slug), don't curry it on the server side and pass the result
down. Pass the plain data down as a prop and import the Server Action directly into the
Client Component, doing any `.bind()`/currying there. This also means this class of bug
is invisible to `tsc`/`eslint`/unit tests — it only surfaces at request time, which is
why manually exercising new pages against a dev server (not just `next build` succeeding)
matters even when every static check is green.

### Common Mistakes
Assuming a successful `next build` proves a Server/Client Component boundary is wired
correctly — this specific error is a request-time RSC serialization check, not a
build-time or type-time one.

---

## `z.coerce.number()` silently accepts an empty string as 0

### Context
Phase 9's `Project` form schema needed to validate a numeric `order` field submitted as
a string (from a native `<input type="number">` or, worst case, no client-side
coercion at all on the server-side re-validation path).

### Problem
`z.coerce.number()` runs `Number(input)` before applying constraints like `.min(0)`.
`Number("")` evaluates to `0` in JavaScript, which is a valid, in-range number — so an
empty/blank order field passes validation silently as `0` instead of being rejected as
missing input. A code-review pass (not automated tooling) is what caught this.

### Approach
Reject blank/non-numeric input explicitly in a `.transform()` before the numeric
schema runs, using `ctx.addIssue()` + `return z.NEVER` to fail with a specific message,
then `.pipe()` the result into `z.number().int().min(0)` for the actual numeric
constraints.

### Why
Coercion and "is this value present/valid" are two different concerns that
`z.coerce.number()` collapses into one step, silently favoring coercion. Any input
whose "empty string" JS-coerces to a meaningful value (`""` → `0`, `""` → `NaN` for
some other coercions) needs its blank/absent case handled before coercion, not after.

### Takeaway
Before using `z.coerce.number()` (or any bare `z.coerce.*`) on a field that comes from
a text input, check what `Number("")` (or the relevant coercion) actually produces —
if it's a value that would pass your constraints, add an explicit blank/absent check
ahead of the coercion rather than trusting the constraint chain to catch it.

---

## `new Date("YYYY-MM-DD")` silently rolls over an invalid calendar date instead of rejecting it

### Context
Phase 9's `ExperienceEntry` form schema needed to validate `startDate`/`endDate`
submitted as `<input type="date">` strings and transform them into `Date` objects for
Prisma.

### Problem
A regex like `/^\d{4}-\d{2}-\d{2}$/` only checks the string's shape. `new
Date("2023-02-30")` doesn't throw and doesn't produce `Invalid Date` — it silently
normalizes to `2023-03-02T00:00:00.000Z`. Verified directly in Node before treating it
as a real bug, not a guess. The browser's native date picker won't produce this input
through the UI, but the Zod schema is also the server-side boundary (C1's
never-trust-the-client rationale) — a request that bypasses the UI entirely could
persist a silently-wrong date with no validation error at all.

### Approach
After transforming the string to a `Date`, round-trip it back through
`date.toISOString().slice(0, 10)` and compare against the original input string inside
the same `.transform()`; mismatch → `ctx.addIssue()` + `return z.NEVER`, same rejection
pattern as the `orderNumber` blank-string check above.

### Why
Same shape as the `z.coerce.number()` lesson: JS's own coercion (`Number("")` → `0`,
`new Date("2023-02-30")` → a different, valid date) silently produces an in-range,
plausible-looking value instead of failing loudly. Format validation (the regex) and
semantic validation (does this calendar date actually exist) are different checks —
passing the first doesn't imply the second.

### Takeaway
Whenever a value passes through a native JS coercion (`Number()`, `new Date()`, etc.)
that "fixes up" out-of-range input instead of throwing, don't assume format-level
validation (regex, type) is enough — round-trip the coerced value and compare it back
against the original input to catch cases where coercion quietly changed the meaning.

---

## How to add lessons

When asked to "Record lessons": only add a lesson that reflects something actually applied
or decided in this project (not generic knowledge), and check this file first to avoid
duplicating an existing entry — extend an existing lesson's Takeaway/Common Mistakes instead
of creating a near-duplicate.
