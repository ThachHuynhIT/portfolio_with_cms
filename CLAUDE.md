@AGENTS.md

## Repository conventions

### AI agent skill directories (`.agents/`, `.claude/skills/`, `.windsurf/skills/`)
`prisma init` (Prisma 7+) installs shared AI-agent skill docs into `.agents/skills/` —
this is the real, tracked source of truth (committed, along with `skills-lock.json`
which pins the source/version/hash of each skill).

`.claude/skills/` and `.windsurf/skills/` are symlinks into `.agents/skills/`, created
so Claude Code and Windsurf discover the same skills via their own tool-specific
convention. They are **gitignored on purpose** (`.gitignore`: `/.claude/skills/`,
`/.windsurf/skills/`) — do not commit them and do not remove the ignore rules.
Reason: this repo's git has `core.symlinks=false` (typical on Windows without
Developer Mode), so `git add` on these symlinked dirs does not store a symlink —
it walks through and stores full duplicate copies of every file under three
different paths. Committing them would triple-track the same content with no
benefit, since `.agents/skills/` alone is sufficient for any tool that resolves
the symlinks locally.

If `.claude/skills/` or `.windsurf/skills/` are ever missing on a fresh clone,
that's expected — they're local, machine-specific symlinks, not app functionality.
Recreate them by re-running `prisma init` (it detects the existing `.agents/skills/`
and skills-lock.json) or by manually symlinking into `.agents/skills/`. Never
"fix" the gap by copying real files into `.claude/skills/`/`.windsurf/skills/`.

### Secrets
Never commit `.env` (it's gitignored). Only `.env.example` — placeholder values
only, no real credentials — is tracked. When a change introduces a new required
env var, update both `.env` (local, real/placeholder value) and `.env.example`
(placeholder) in the same change so the two never drift apart.

## Git & task workflow

This project is also how the maintainer is learning Git, branching, commits, PRs,
code review, Next.js, Prisma, Postgres, auth, testing, software architecture, and
effective Claude Code usage. Prefer teaching/explaining over silently generating
code — the process matters as much as the result.

### Branching
- `main` is always stable and deployable. `develop` is the integration branch.
- Every feature/task branch is created **from `develop`**, not from `main`:
  `feature/<name>`, `fix/<name>`, `refactor/<topic>`, `chore/<topic>`.
- Never implement a feature directly on `main` or directly on `develop` — always
  through a dedicated branch, even small ones, unless the change is genuinely
  trivial (see below).
- Keep each branch scoped to one meaningful feature or learning topic. Don't
  create a branch for a tiny/trivial change.
- `main` only moves forward via merges from `develop` (releases) — that's a
  separate decision the maintainer makes, not part of the per-task flow below.

### Per-task process
Always state which STEP is currently active. Do not skip steps for non-trivial tasks.

1. **Check git state** — current branch, `git status`, recent commits, confirm no
   unexpected uncommitted changes. Confirm the task branch is created from (and
   up to date with) `develop`. No modifications yet.
2. **Analyze** — read the relevant existing code, `CLAUDE.md`/`AGENTS.md`, current
   architecture, dependencies/side effects. Explain the problem and proposed
   solution. No code changes yet.
3. **Plan** — goal, requirements, files to create/change, DB changes,
   API/server-side changes, UI changes, validation, error handling, security
   considerations, testing strategy, risks. Keep it simple, avoid unnecessary
   abstractions. **Stop and wait for approval before implementing.**
4. **Implement** — only the approved scope, following the existing architecture.
   No unrelated features, no unnecessary new dependencies, no unrelated files.
5. **Verify** — run lint, tests, build (when appropriate), check for TypeScript
   errors, review the final `git diff`. Do not commit.
6. **Code review** — review as a senior engineer: bugs, security issues, data
   integrity, TypeScript issues, architecture problems, unnecessary abstractions,
   duplicated code, error handling, edge cases, accessibility, test coverage.
   Report findings only — do not modify code during this step.
7. **Fix review findings** — only after approval, fix reported issues, re-run
   lint/tests/build, show the final diff. Do not commit.
8. **Commit** — the maintainer reviews the diff and commits it themselves.
   Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`,
   `chore:`) with a clear description, e.g. `feat: add project CRUD`.
9. **Pull request** — after the maintainer pushes, help prepare a PR **targeting
   `develop`** with: summary, changes, technical decisions, testing performed,
   potential risks, and screenshots for UI changes.
10. **PR review** — before merge, review the branch against `develop` for
    correctness, architecture, security, DB migration safety, regression risk,
    test coverage, and unnecessary changes. The maintainer decides when to merge.

### Hard rules
- Never commit, push, merge, or delete branches automatically.
- Never make destructive changes without asking.
- Never expand scope without asking.
- Never skip the planning step (3) for a non-trivial task.
- If requirements are ambiguous, ask before implementing.
- If a better architectural approach is found mid-task, explain it before
  changing direction — don't switch silently.
- Before committing anything (when explicitly asked to), run `npm run lint`
  and `npm run build` and make sure both are clean.
