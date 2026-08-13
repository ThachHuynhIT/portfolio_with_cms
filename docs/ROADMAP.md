# Project Roadmap

Bức tranh toàn dự án: phase đã xong, phase còn lại, theo thứ tự nào. Đây **không phải**
changelog (xem `docs/CHANGELOG.md` cho chi tiết những gì đã làm) và **không phải** lesson
(xem `docs/LESSONS.md`). File này chỉ trả lời "phase nào, theo thứ tự nào, còn thiếu gì."

---

## Đã hoàn thành (Phase 0–3)

Chi tiết đầy đủ ở `docs/CHANGELOG.md`. Tóm tắt:

- **Phase 0 — Foundation scaffold**: Next.js 16 App Router, Prisma 7 schema đầy đủ
  (`AdminUser`, `SiteSettings`, `Skill`, `ExperienceEntry`, `Project`, `BlogPost`,
  `Testimonial`, `ContactMessage`), `@prisma/adapter-pg`, alias/styling convention.
- **Phase 1 — Prisma + Neon + public pages**: migration + seed đầu tiên, `src/lib/queries.ts`
  làm điểm enforce published/draft duy nhất, 6 trang public đọc từ Postgres qua Neon pooled
  endpoint.
- **Phase 2 — UI pass**: convert 6 trang public sang SCSS Modules, dark theme mặc định, fix
  bug `--font-sans`, `cache()` cho `getSiteSettings()`.
- **Phase 3 — MCP + AI Development Workflow**: `postgres-readonly` MCP (role DB chỉ SELECT,
  verify từ chối write ở tầng DB) và `github` MCP (fine-grained PAT, 1 repo) cho dev tooling
  local; 3 MCP cá nhân ngoài scope phase này (Context7, Cloudinary local, Vercel) với quyết
  định auth model riêng từng cái; không có MCP client code nào trong `src/`, app build/chạy
  độc lập với MCP. Toàn bộ 8 exit criteria đã đạt — chi tiết ở `docs/CHANGELOG.md`.

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

## Roadmap Phase 4+ (đề xuất thứ tự)

| # | Phase | Mục tiêu chính | Vì sao thứ tự này |
|---|---|---|---|
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

Phase 3 (MCP + AI Development Workflow) đã hoàn thành — kế hoạch chi tiết gốc (goal, scope,
security, verification, exit criteria) không lặp lại ở đây nữa, xem lịch sử git của file này
(`git log -p -- docs/ROADMAP.md`) hoặc entry Phase 3 ở `docs/CHANGELOG.md` cho đầy đủ.

Mỗi phase khi thực sự bắt đầu vẫn đi qua quy trình trong `CLAUDE.md`: branch riêng từ
`develop` (`feature/phase<N>-<name>`), Analyze → Plan → Implement → Verify → Review, và cập
nhật `docs/CHANGELOG.md`/`docs/LESSONS.md` khi xong. File này chỉ đánh dấu phase đã
bắt đầu/hoàn thành — không lặp lại chi tiết implementation.

## Cách cập nhật file này

Khi một phase mới bắt đầu hoặc hoàn thành: cập nhật bảng "Đã hoàn thành" và bảng roadmap ở
trên (đổi số phase đã xong thành mục "Đã hoàn thành", cập nhật snapshot "chưa có gì" nếu một
mục đã được implement) — không viết lại toàn bộ file.
