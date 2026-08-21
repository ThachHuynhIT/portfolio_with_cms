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

### Styling
- **SCSS Modules (`*.module.scss`) là cách styling mặc định** cho page/component
  layout, spacing, typography, responsive, và animation/visual styling.
- Tailwind chỉ dùng khi thực sự phù hợp — đặc biệt cho `shadcn/ui` (giữ nguyên
  cách nó style, không convert) và các utility đơn giản, một-lần dùng.
- Không dùng chuỗi class Tailwind dài cho page/component nếu một SCSS Module là
  lựa chọn phù hợp hơn.
- Không dùng inline style (`style={{ ... }}`) trừ khi có lý do kỹ thuật rõ ràng
  (ví dụ: giá trị tính toán runtime không thể biểu diễn bằng class tĩnh).
- Style riêng của 1 component/page không đặt trong `globals.css` — chỉ những
  gì thực sự toàn cục (theme tokens, reset, font) mới ở đó.
- File `.module.scss` colocate ngay cạnh component/page nó phục vụ (cùng
  folder). Token/mixin dùng chung nằm ở `src/styles/` (`@styles/*`), import
  bằng `@use "@styles/variables" as vars;` / `@use "@styles/mixins" as mix;`.
- **Trạng thái hiện tại:** shadcn/ui setup (Phase 0) và các trang public của
  Phase 1 (home/about/projects/blog) vẫn dùng Tailwind utility class cho layout
  — viết từ trước khi rule này có. Đây là nợ kỹ thuật đã biết, sẽ chuyển sang
  SCSS Modules dần ở phase sau, không convert hồi tố trong lúc thiết lập rule.

### Module aliases
TypeScript path aliases hiện có (`tsconfig.json`), mỗi alias trỏ tới một thư
mục **thực sự tồn tại** với nội dung thật — không tạo alias cho domain/module
chưa có:

| Alias | Trỏ tới | Có thật vì |
|---|---|---|
| `@/*` | `./src/*` | gốc, dùng chung |
| `@components/*` | `./src/components/*` | `ui/` (shadcn) đã có |
| `@lib/*` | `./src/lib/*` | `prisma.ts`, `utils.ts`, `queries.ts` |
| `@styles/*` | `./src/styles/*` | shared SCSS partials (`_variables.scss`, `_mixins.scss`) |

- Ưu tiên dùng alias khi import giữa các module khác nhau; tránh relative
  import sâu kiểu `../../../`.
- Relative import (`./`, `../`) vẫn dùng bình thường cho file gần nhau trong
  cùng component/module (ví dụ colocated `.module.scss`).
- **Không** tạo alias cho domain chưa tồn tại thật trong code (ví dụ
  `@modules/*`, `@portfolio/*`, `@projects/*`, `@blog/*`, `@about/*`,
  `@contact/*`) chỉ vì route group cùng tên đang tồn tại ở
  `src/app/(public)/...` — route group là routing, không phải domain module có
  logic riêng. Nếu sau này thực sự tái cấu trúc thành domain module
  (`src/modules/<domain>/`), thêm alias tương ứng lúc đó, như một quyết định
  kiến trúc riêng — không thêm alias rỗng trước để "dành chỗ".
- Không tạo alias cho mọi folder nhỏ — alias phải đại diện cho một application
  boundary có ý nghĩa (đủ lớn/đủ dùng chung để việc gọi tên tắt có giá trị).

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
<!-- Skip this rule - Never commit, push, merge, or delete branches automatically. -->
- Never make destructive changes without asking.
- Never expand scope without asking.
- Never skip the planning step (3) for a non-trivial task.
- If requirements are ambiguous, ask before implementing.
- If a better architectural approach is found mid-task, explain it before
  changing direction — don't switch silently.
- Before committing anything (when explicitly asked to), run `npm run lint`
  and `npm run build` and make sure both are clean.

### Operating modes

Default mode is **Learning Mode** — the per-task process above, in full (state each
STEP, explain before implementing, wait for plan approval at Step 3, narrate decisions).
Use this whenever a task doesn't specify otherwise.

**Full Auto Mode** — opt in per task by prefixing the request with `full auto:`. Same
end-to-end responsibility (branch → implement → validate → docs → report), optimized for
less token/context and less narration, without lowering engineering quality:

- **Read minimally.** Only files/rules/docs relevant to the task. Don't re-read this
  file's rules or scan all of `docs/CHANGELOG.md`/`docs/LESSONS.md` — jump to the
  relevant section only.
- **Execute over explain.** Skip step-by-step narration and the Step-3 stop-and-wait for
  plan approval. Steps 1-2 (check git state, analyze) still happen, just silently.
- **Ask only when:** the action is destructive/hard-to-reverse, touches shared/remote
  state, expands scope beyond the request, or the requirement is genuinely ambiguous.
  Everything else proceeds without a pause.
- **No incremental progress messages** for routine sub-steps (one file read, one edit,
  one test run). Still surface: branch creation, any risk/ambiguity pause, and the final
  report.
- **Self-review replaces the separate Code Review step.** Still check for bugs,
  security, data integrity, TypeScript issues, accessibility, and edge cases before
  reporting — just fold it into fixing rather than a separately narrated review pass.
- **MCP tools:** call only when the task genuinely needs one, and request the minimal
  output needed.
- **Docs are mandatory, not optional:**
  - Update `docs/CHANGELOG.md` for every meaningful change (new feature, schema/API
    change, dependency added, architectural decision, breaking change). Skip for
    typos/formatting/pure refactors with no behavior change.
  - Update `docs/LESSONS.md` only when something has lasting reuse value (a technique, a
    bug root-cause worth remembering, a non-obvious decision rationale). Most tasks won't
    need this.
  - Write both so a future session can resume cold after `/clear` from these files alone.
- **Final report format** (replaces prose summaries):
  ```
  Changed: <files/behavior>
  Validation: <lint/test/build results>
  Docs: <CHANGELOG/LESSONS updated? yes/no + what>
  Status: <done | blocked on X | awaiting review>
  ```
- **Never relaxes:** security, input validation, error handling, logging, or the Hard
  Rules above (no auto-commit/push/merge/delete, no scope creep, no destructive action
  without asking, no skipping lint/build before commit). Full Auto Mode cuts process
  *overhead*, never engineering *rigor*.
