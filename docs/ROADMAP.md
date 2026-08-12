# Project Roadmap

Bức tranh toàn dự án: phase đã xong, phase còn lại, theo thứ tự nào. Đây **không phải**
changelog (xem `docs/CHANGELOG.md` cho chi tiết những gì đã làm) và **không phải** lesson
(xem `docs/LESSONS.md`). File này chỉ trả lời "phase nào, theo thứ tự nào, còn thiếu gì."

---

## Đã hoàn thành (Phase 0–2)

Chi tiết đầy đủ ở `docs/CHANGELOG.md`. Tóm tắt:

- **Phase 0 — Foundation scaffold**: Next.js 16 App Router, Prisma 7 schema đầy đủ
  (`AdminUser`, `SiteSettings`, `Skill`, `ExperienceEntry`, `Project`, `BlogPost`,
  `Testimonial`, `ContactMessage`), `@prisma/adapter-pg`, alias/styling convention.
- **Phase 1 — Prisma + Neon + public pages**: migration + seed đầu tiên, `src/lib/queries.ts`
  làm điểm enforce published/draft duy nhất, 6 trang public đọc từ Postgres qua Neon pooled
  endpoint.
- **Phase 2 — UI pass**: convert 6 trang public sang SCSS Modules, dark theme mặc định, fix
  bug `--font-sans`, `cache()` cho `getSiteSettings()`.

## Snapshot hiện tại — chưa có gì (xác nhận qua code, không phải giả định)

Ngoài các trang public đọc dữ liệu ở trên, các phần sau **chưa có bất kỳ dòng code nào** —
package liên quan chỉ nằm trong `package.json` như dependency chưa dùng tới:

| Khu vực | Trạng thái |
|---|---|
| Admin route (`src/app/admin/` hoặc `(admin)/`) | Không tồn tại |
| Auth.js wiring (`auth.ts`, `[...nextauth]`, `signIn`) | Không có, chỉ có dependency |
| API routes / server actions (CRUD) | Không tồn tại — chỉ có read-only `queries.ts` |
| Cloudinary upload | Không có code, chỉ có dependency |
| Resend email | Không có code, chỉ có dependency |
| Markdown rendering (`react-markdown`, `rehype-*`, `remark-gfm`) | Không có code, chỉ có dependency; `BlogPost.content` hiện là raw string |
| Contact form (public) | Không tồn tại |
| `middleware.ts` (route protection) | Không tồn tại |
| SEO infra (`generateMetadata` per-page, `sitemap.ts`, `robots.ts`) | Không có, chỉ có 1 `metadata` tĩnh ở `layout.tsx` |
| Test framework (Vitest/Playwright/Jest) | Không có |
| shadcn/ui components | Chỉ có `Button` (`src/components/ui/button.tsx`) |

## Roadmap Phase 3+ (đề xuất thứ tự)

| # | Phase | Mục tiêu chính | Vì sao thứ tự này |
|---|---|---|---|
| 3 | **MCP + AI Development Workflow** | Học MCP (fundamentals, Postgres/Neon read-only, permissions/security, GitHub) như developer tooling, không phải CMS feature — verify UI tiếp tục dùng `claude-in-chrome` sẵn có, không setup thêm Browser MCP riêng | Đặt sau Phase 1 vì cần schema + `queries.ts` thật để có gì đó để đọc qua MCP; đặt trước Auth để việc học tooling không trộn với luồng bảo mật/CRUD của ứng dụng thật |
| 4 | **Admin Auth** | Auth.js credentials login cho `AdminUser` (đã có model + `bcryptjs`), route protection cho `/admin` qua `middleware.ts` | Mọi phase admin sau đều cần cổng vào trước |
| 5 | **Admin CRUD** | Server actions/forms quản lý Project, BlogPost, Skill, ExperienceEntry, Testimonial, SiteSettings, xem ContactMessage — cần scaffold thêm shadcn primitives (form, input, table, dialog...) | Cần Phase 4 xong để gate; là phần lõi của "CMS" |
| 6 | **Image upload (Cloudinary)** | Signed upload cho `coverImageUrl`, `galleryUrls`, `avatarUrl`, `heroImageUrl`, `ogImageUrl` | Cần form CRUD ở Phase 5 để có nơi gắn upload UI vào |
| 7 | **Markdown rendering** | `react-markdown` + `rehype-sanitize` + `rehype-highlight` + `remark-gfm` cho `BlogPost.content` ở trang public; xem xét editor/preview ở admin | Độc lập về kỹ thuật, nhưng hợp lý làm cùng lúc với CRUD content để có preview |
| 8 | **Contact form + email** | Form public ghi `ContactMessage`, gửi notification qua Resend tới `CONTACT_NOTIFICATION_EMAIL` | `ContactMessage` model đã sẵn từ Phase 0; độc lập, có thể làm sớm hơn nếu muốn "quick win" |
| 9 | **SEO infra** | `generateMetadata` per-page dùng `seoTitle`/`seoDescription` từ DB, `sitemap.ts`, `robots.ts` | Cần nội dung thật (Phase 5–7) ổn định trước khi tối ưu SEO |
| 10 | **Testing** | Chọn framework (Vitest/Playwright), test tối thiểu cho: filter draft/published (`queries.ts`), auth gate, contact form | Đủ giá trị nhất khi có CRUD + auth để test, dù có thể bắt đầu sớm hơn nếu muốn TDD |
| 11 | **Polish / release prep** | Accessibility pass, responsive check, merge `develop` → `main` | Cuối cùng, sau khi các phase chức năng ổn định |

Thứ tự trên dựa trên phụ thuộc kỹ thuật (auth trước CRUD, CRUD trước upload UI), không phải
ràng buộc cứng — Phase 7, 8, 10 có thể đảo thứ tự tuỳ ưu tiên.

### Phase 3 (chi tiết) — MCP + AI Development Workflow

- **Goal**: Học MCP trực tiếp trong project này để Claude Code (và tool MCP-compatible
  khác) có thể truy cập context liên quan đến project (DB schema đọc, GitHub repo) một
  cách có kiểm soát — không chạm production write, không rò secret, không trở thành
  runtime dependency của app.
- **Scope**: Trong scope — config MCP server cho local dev (Claude Code project/user
  config), Postgres/Neon MCP read-only, GitHub MCP, hiểu permission model sẵn có của
  Claude Code cho MCP tool. Ngoài scope — bất kỳ MCP server nào có write access vào
  production DB; dùng MCP trong runtime code (API routes/server actions/pages); setup
  Browser MCP riêng (đã có `claude-in-chrome` cho việc verify UI); thêm SaaS/service mới
  không có lý do cụ thể; đổi Prisma schema hay tech stack vì MCP.
- **Learning objectives** (theo đúng thứ tự ưu tiên, đã bỏ Browser MCP riêng — xem ghi chú
  bên dưới):
  1. MCP fundamentals — protocol, client/server model, tools/resources, cách Claude Code
     gọi MCP tool khác gì với code path bình thường.
  2. Postgres/Neon MCP — READ ONLY — dùng role/connection string riêng, chỉ SELECT.
  3. MCP permissions/security — hiểu permission prompt sẵn có của Claude Code cho MCP
     tool, scope theo project.
  4. GitHub MCP — xác định action nào an toàn để tự động hoá (issue/PR/comment), vẫn phải
     đi qua các gate thủ công đã định nghĩa ở `CLAUDE.md` (không tự commit/push/merge).
  5. MCP khác — chỉ đánh giá thêm khi có use case thật, không thêm để "cho có" (bao gồm cả
     một MCP server browser theo đúng protocol, nếu sau này có lý do cụ thể cần học riêng
     phần đó).

  Ghi chú Browser: verify UI change dùng `claude-in-chrome` (đã có sẵn trong Claude Code,
  không phải MCP server riêng) — không setup thêm Browser MCP ở phase này, vì việc verify
  UI đã được `claude-in-chrome` đáp ứng, tránh trùng công cụ không cần thiết.
- **Implementation order**: đúng theo thứ tự Learning objectives ở trên (1 → 4), bước sau
  chỉ bắt đầu khi bước trước đã verify xong; bước 3 (permissions/security) phải hiểu rõ
  trước khi thêm GitHub MCP ở bước 4.
- **Security**:
  - Không cấp write access vào production DB ở giai đoạn đầu — role Postgres/Neon riêng
    cho MCP, tách khỏi `DATABASE_URL` của app, chỉ có quyền SELECT ở tầng DB (GRANT/REVOKE
    thật, không chỉ dựa vào quy ước).
  - Không lưu secret trong Git — theo đúng convention `.env`/`.env.example` đã có ở
    `CLAUDE.md`; nếu MCP cần file config có token, thêm vào `.gitignore` và có
    `.example` placeholder tương ứng; file config MCP commit được (nếu có) chỉ chứa tham
    chiếu biến môi trường, không chứa giá trị thật.
  - GitHub MCP dùng fine-grained personal access token scope đúng 1 repo này, quyền tối
    thiểu cần cho việc đang làm — không dùng token cá nhân full-scope/toàn org.
  - MCP không được bypass validation/business logic của app — MCP đọc DB là raw access
    cho mục đích dev/inspect, không đi qua `src/lib/queries.ts`; không bao giờ nối output
    MCP vào cái render cho end user.
  - MCP là developer tooling, không phải runtime dependency — app (server/API
    routes/server actions) không được import/gọi MCP server; app phải build và chạy được
    khi không có MCP server nào cấu hình.
  - Write-capable tool (vd GitHub MCP tạo PR) vẫn phải qua cùng cơ chế xác nhận thủ công
    như trong `CLAUDE.md` (never commit/push/merge/PR tự động) — dựa vào permission prompt
    mặc định sẵn có của Claude Code cho việc này, không cần thêm policy default-deny riêng.
- **Verification**:
  - Thử INSERT/UPDATE/DELETE bằng role MCP read-only và xác nhận bị DB từ chối ở tầng
    quyền (không chỉ dựa vào convention).
  - `npm run build` / `npm run lint` vẫn pass khi không có biến môi trường MCP nào được
    set (chứng minh app không phụ thuộc runtime vào MCP).
  - Grep `src/` xác nhận không có MCP client code nào được import vào app code.
  - Mọi env var mới liên quan MCP đều có mặt ở cả `.env` và `.env.example`, không có secret
    thật bị commit.
- **Deliverables**:
  - Role Postgres/Neon read-only cho MCP đã tạo, cách tạo được ghi lại (không phải secret
    thật).
  - GitHub fine-grained PAT dùng cho MCP đã tạo, scope/quyền đã dùng được ghi lại (không
    phải token thật).
  - Ghi nhận learning theo từng objective ở `docs/LESSONS.md` (đúng tinh thần "process
    matters" của `CLAUDE.md`).
- **Exit criteria**:
  - Giải thích được MCP fundamentals và demo được 1 read-only query qua MCP.
  - Role DB read-only đã verify từ chối write ở tầng DB.
  - GitHub MCP đã dùng thật cho ít nhất 1 việc dev nhỏ (vd đọc issue/PR), qua permission
    prompt sẵn có của Claude Code, không tự commit/push/merge.
  - Verify UI change tiếp tục dùng `claude-in-chrome` như hiện tại — không cần setup thêm
    Browser MCP riêng ở phase này.
  - Không có secret MCP nào từng xuất hiện trong git history/tracked files.
  - App build/chạy bình thường khi tắt hết MCP.
  - Có quyết định rõ ràng (dù là "chưa cần") về việc có thêm MCP nào khác ngoài Postgres/Neon
    MCP và GitHub MCP hay không.

Mỗi phase khi thực sự bắt đầu vẫn đi qua quy trình trong `CLAUDE.md`: branch riêng từ
`develop` (`feature/phase<N>-<name>`), Analyze → Plan → Implement → Verify → Review, và cập
nhật `docs/CHANGELOG.md`/`docs/LESSONS.md` khi xong. File này chỉ đánh dấu phase đã
bắt đầu/hoàn thành — không lặp lại chi tiết implementation.

## Cách cập nhật file này

Khi một phase mới bắt đầu hoặc hoàn thành: cập nhật bảng "Đã hoàn thành" và bảng roadmap ở
trên (đổi số phase đã xong thành mục "Đã hoàn thành", cập nhật snapshot "chưa có gì" nếu một
mục đã được implement) — không viết lại toàn bộ file.
