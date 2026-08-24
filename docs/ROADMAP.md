# Project Roadmap

Bức tranh toàn dự án: phase đã xong, phase còn lại, theo thứ tự nào. Đây **không phải**
changelog (xem `docs/CHANGELOG.md` cho chi tiết những gì đã làm) và **không phải** lesson
(xem `docs/LESSONS.md`). File này chỉ trả lời "phase nào, theo thứ tự nào, còn thiếu gì,
và làm xong thì căn cứ vào đâu để nói là xong."

---

## Đã hoàn thành (Phase 0–10, 12)

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
- **Phase 4 — Admin Auth**: Auth.js v5 credentials provider, JWT session, `src/proxy.ts`
  (Next.js 16 đổi tên `middleware.ts` → `proxy.ts`) làm UX redirect, gate thật ở
  `src/app/admin/(protected)/layout.tsx` (C1), rate-limit brute-force theo email trong
  memory (giới hạn đã biết trên Vercel serverless — nhiều instance không dùng chung state,
  chấp nhận được cho 1 admin account).
- **Phase 5 — CI + typecheck**: `npm run typecheck` (`next typegen && tsc --noEmit`),
  `.github/workflows/ci.yml` chạy lint + typecheck + build trên PR vào `develop`/`main`.
- **Phase 6 — Deployment readiness + Vercel**: production chạy thật tại
  `portfolio-with-cms-gilt.vercel.app`, track branch `develop` (không phải `main`), Neon
  branch riêng cho production, `vercel-build` script chạy `prisma migrate deploy`,
  `error.tsx`/`not-found.tsx`, SSO protection Vercel chỉ bật cho preview.
- **Phase 7 — Markdown renderer (public)**: `<Markdown>` dùng chung (`react-markdown` +
  `remark-gfm` + `rehype-sanitize` + `rehype-highlight`) áp dụng cho cả `BlogPost.content`
  và `Project.description`; `rehype-sanitize` chạy trước `rehype-highlight` để giữ được
  class `hljs-*`; không dùng `rehype-raw` nên HTML thô trong markdown bị `remark-rehype`
  loại bỏ mặc định, sanitize chỉ là defense-in-depth.
- **Phase 8 — Test foundation (Vitest)**: `vitest` + `vitest.config.mts`, test thật cho
  `src/lib/queries.ts` (invariant PUBLISHED-only, mock Prisma thay vì DB thật — lý do ở
  `docs/LESSONS.md`) và `src/lib/auth/rate-limit.ts`; nối vào `.github/workflows/ci.yml`
  (`npm run test` giữa `typecheck` và `build`).
- **Phase 9 — Admin CRUD**: CRUD đầy đủ cho `Project`, `BlogPost`, `Skill`, `ExperienceEntry`,
  `Testimonial`, `SiteSettings` (mỗi model một PR) cộng view + mark-as-read cho
  `ContactMessage` (không phải CRUD thứ 7 — admin không bao giờ tạo/sửa message, xem
  `docs/CHANGELOG.md`). `revalidatePath` sau mutation đã verify bằng tay trên production thật
  (2026-08-21): publish/unpublish `Project`/`BlogPost` và đổi `SiteSettings.siteName` đều phản
  ánh ngay trên trang public, không cần rebuild.
- **Phase 10 — UI/UX Overhaul (public + admin)**: design system thật (token owner rule giữa
  CSS var và SCSS `$var`, ramp oklch neutral/brand/accent, motion system qua `motion`), theme
  switching thật (bỏ hardcode `dark`), redesign 4 trang public (home/projects/blog/about) +
  toàn bộ admin (shell/sidebar/topbar/user-menu, `AdminPageHeader`/`AdminDataTable` (tanstack
  table v9)/`AdminFormShell`/`useAdminForm` dùng chung cho 6 model, dashboard thật với
  `$transaction` 8 statement). Mở thành 15 PR thực tế (0–10 + A–D, thay 19 PR gốc trong spec
  nhờ gộp 8 PR admin cuối 11–18 → 4). Sửa được nhiều bug thật trong lúc làm: `Toaster` thiếu
  `ThemeProvider`, drift radius 12px/10px, `--border` dark trong suốt, "lưu thành công không
  thấy gì" (mọi form redirect nên code sau `await` chết), a11y audit tĩnh (không browser) bắt
  được `TagsInput` mất focus và `role="toolbar"` khai báo sai. Chi tiết đầy đủ ở
  `docs/CHANGELOG.md` (2 entry "Phase 10 (PR 1–10 of 19)" và "Phase 10 (PR A–D)").
- **Phase 12 — Contact form + email**: trang `/contact` công khai, `submitContactMessageAction`
  là server action **không cần đăng nhập đầu tiên** trong repo. Rate limit theo IP (3/giờ,
  `src/lib/rate-limit.ts` — factory dùng chung, tách ra từ rate-limiter login Phase 4) +
  honeypot (field ẩn ngoài schema Zod, action trả thành công giả khi dính bẫy) chạy trước cả
  Zod validate. Resend gửi trong `try/catch` riêng — lỗi Resend không rollback
  `ContactMessage`. Header email không nội suy input thô (`from`/`subject` hardcode, chỉ
  `replyTo` dùng email đã validate). Verify toàn bộ bằng submit thật qua browser thật (không
  chỉ unit test): submit hợp lệ lưu đúng DB và hiện trong admin, Resend lỗi thật (thiếu API
  key) vẫn giữ message, honeypot trả thành công giả không đụng DB/Resend, submit thứ 4 trong
  giờ bị chặn đúng. **Làm trước Phase 11 (branch tạo từ `develop` trước khi PR #42 merge, hai
  phase không phụ thuộc nhau)** — chi tiết `docs/CHANGELOG.md` Phase 12.

## Snapshot hiện tại — chưa có gì (xác nhận qua code, không phải giả định)

Ngoài các trang public đọc dữ liệu ở trên, các phần sau **chưa có bất kỳ dòng code nào** —
package liên quan chỉ nằm trong `package.json` như dependency chưa dùng tới:

| Khu vực | Trạng thái |
|---|---|
| Cloudinary upload | Không có code, chỉ có dependency |
| Form/validation stack (`zod`, `react-hook-form`, `@hookform/resolvers`) | Có code (Phase 9 gốc; Phase 10 PR C thêm `useAdminForm` dùng chung cho cả 6 model) |
| Table stack (`@tanstack/react-table`) | Có code — Phase 9 dùng v9 `useTable`/`tableFeatures` per-model; Phase 10 PR B thay bằng `AdminDataTable` dùng chung, `createTableHook` (`src/components/admin/admin-table.ts`) |
| SEO infra (`generateMetadata` per-page, `sitemap.ts`, `robots.ts`) | Không có, chỉ có 1 `metadata` tĩnh ở `layout.tsx` |
| `loading.tsx` | Có ở cả public (Phase 10 PR 6/7/8/9) và admin (Phase 10 PR B: 6 route list/table; PR C: 6 route `[id]/edit`+`settings`); `error.tsx`/`not-found.tsx` đã có (Phase 6, thêm bản admin ở Phase 10 PR A) |
| Test framework | Vitest đã có (Phase 8); Playwright/E2E vẫn chưa |
| shadcn/ui components | `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `AlertDialog`, `Field`, `Label`, `Separator`, `Sonner` (Phase 9); `dropdown-menu` (Phase 10 PR A) |

## Quyết định kiến trúc cross-cutting

Sáu quyết định dưới đây **cắt ngang nhiều phase**. Chốt sai hoặc chốt muộn thì phải sửa lan
ra nhiều nơi, nên mỗi mục ghi rõ phải chốt xong ở phase nào.

| # | Vấn đề | Hướng đã chốt / cần chốt | Chốt ở phase |
|---|---|---|---|
| C1 | **Auth check ở đâu** | `middleware.ts` chỉ là UX redirect. Session phải được kiểm tra **lại** trong admin layout và trong **mọi** server action. Middleware-only auth từng bị bypass bằng header (CVE-2025-29927) — không bao giờ coi middleware là ranh giới bảo mật duy nhất. | 4 |
| C2 | **Session strategy** | Schema không có model `Session`/`Account` → Auth.js buộc dùng **JWT strategy**. Nếu sau này muốn database session thì phải thêm migration — đó là một quyết định riêng, không phải chi tiết implementation. | 4 |
| C3 | **Cache / revalidate** | Trang public hiện query DB mỗi request. Khi có CRUD, publish/unpublish **phải** invalidate trang public tương ứng (`revalidatePath`/`revalidateTag`). Phải thiết kế *trong* phase CRUD, không phải phát hiện sau khi deploy — nó quyết định cả chi phí Neon lẫn tốc độ trang. | 9 (ràng buộc build xuất hiện từ 5) |
| C4 | **Ranh giới public/admin của tầng query** | `src/lib/queries.ts` giữ nguyên vai trò "luôn filter PUBLISHED", **không** được thêm tham số kiểu `includeDrafts`. Admin đọc DRAFT qua module riêng (`src/lib/admin/*`), chỉ gọi sau auth check. Đây là cách duy nhất giữ được invariant của Phase 1. | 9 |
| C5 | **`SiteSettings.socialLinks` là `Json` không kiểu** | ✅ `src/lib/social-links.ts` — `socialLinksSchema` dùng chung, `parseSocialLinks()` là điểm đọc duy nhất được phép (public qua `getSocialLinks()` trong `queries.ts`, admin qua form + action), không truy cập trực tiếp field `Json` ở đâu cả. | 9 |
| C6 | **Env dev-tooling vs env production** | `MCP_POSTGRES_READONLY_URL` và `CONTEXT7_API_KEY` là dev tooling local, **không bao giờ** được thêm vào Vercel. Mọi lần thêm env var mới phải cập nhật đồng thời `.env` và `.env.example` (rule đã có trong `CLAUDE.md`). | 6 |

## Roadmap Phase 4+

| # | Phase | Mục tiêu một dòng |
|---|---|---|
| 4 | Admin Auth | Cổng vào `/admin` bằng Auth.js credentials |
| 5 | CI + typecheck | Mọi PR vào `develop` tự chạy lint + typecheck + build |
| 6 | Deployment readiness + Vercel | Site chạy thật, mỗi PR có preview deployment |
| 7 | Markdown renderer (public) | `BlogPost.content` render đúng thay vì raw string |
| 8 | Test foundation (Vitest) | Có chỗ viết test **trước** khi CRUD ra đời |
| 9 | Admin CRUD | Phần lõi của "CMS" |
| 10 | UI/UX Overhaul (public + admin) | Design system thật, light+dark, motion, dọn duplicate admin, a11y baseline |
| 11 | Image upload (Cloudinary) | Signed upload cho các field ảnh |
| 12 | Contact form + email | Ghi `ContactMessage` + notify qua Resend |
| 13 | SEO | 13a cơ học (làm được sớm) + 13b đọc từ DB |
| 14 | A11y + responsive polish (audit cuối) | Rà soát chất lượng UI toàn site sau khi mọi tính năng ổn định |
| 15 | Release | Merge `develop` → `main` |

Thứ tự dựa trên phụ thuộc kỹ thuật, không phải ràng buộc cứng. Ba điểm neo thật sự:
auth (4) trước deploy (6) để `/admin` không lộ ra internet lúc chưa có cổng; CI (5) trước
deploy (6) để preview deployment có gate chất lượng; test foundation (8) trước CRUD (9) để
CRUD được viết kèm test thay vì retrofit. Phase 7, 12, 13a có thể kéo lên/đẩy xuống tuỳ ưu tiên.

**Đánh số lại 2026-08-21 (quyết định D3, `docs/superpowers/specs/2026-08-21-phase10-ui-ux-overhaul-design.md`):**
Phase 10 cũ (Image upload) → 11; Phase 11 cũ (Contact form) → 12; Phase 12 cũ (SEO) → 13;
Phase 13 cũ (A11y) → 14 (co lại thành audit cuối, vì a11y baseline dồn vào Phase 10 mới —
D2); Phase 14 cũ (Release) → 15. An toàn vì 10–14 cũ chưa có dòng code hay entry CHANGELOG
nào tại thời điểm đánh số lại. Phase 10 mới (UI/UX Overhaul) chen vào vì Phase 11/12/13 đều
thêm UI mới — có design system + admin primitives trước thì xây lên nền có sẵn thay vì phải
sửa lại UI ba lần.

---

### Phase 4 — Admin Auth

- **Mục tiêu**: đăng nhập được vào `/admin` bằng `AdminUser` đã seed; mọi thứ dưới `/admin`
  bị chặn khi chưa đăng nhập.
- **Scope**: `auth.ts` (Auth.js v5), credentials provider verify bằng `bcryptjs`, JWT session,
  trang `/admin/login`, `middleware.ts`, gate lặp lại ở admin layout, chặn brute-force.
- **Ngoài scope**: bất kỳ CRUD nào; multi-user/role; OAuth provider; quên mật khẩu.
- **Exit criteria**:
  1. Đăng nhập bằng `ADMIN_EMAIL`/`ADMIN_PASSWORD` đã seed thành công.
  2. Sai mật khẩu **và** email không tồn tại trả về cùng một thông báo lỗi chung — không tiết
     lộ email nào có trong DB.
  3. Truy cập `/admin` khi chưa đăng nhập bị chặn **kể cả khi bỏ qua middleware** — verify
     bằng gate ở layout, không chỉ bằng thao tác trên trình duyệt.
  4. Có ít nhất một rào chắn brute-force trên login.
  5. `AUTH_SECRET` có trong cả `.env` và `.env.example`; `npm run lint` + `npm run build` sạch.
- **Rủi ro**: coi middleware là ranh giới bảo mật (xem C1). Nếu chỉ gate ở middleware thì
  phase này *trông như* xong nhưng thực chất chưa bảo vệ được gì.

### Phase 5 — CI + typecheck ✅ Implement xong, đã verify CI chạy xanh trên PR thật (2026-08-14)

- **Mục tiêu**: PR vào `develop` không merge được nếu lint/typecheck/build hỏng — tự động hoá
  đúng bước "chạy lint và build trước khi commit" đang làm thủ công trong `CLAUDE.md`.
- **Scope**: thêm script `typecheck` (`next typegen && tsc --noEmit` — không phải chỉ
  `tsc --noEmit`, xem Vấn đề đã gặp bên dưới), `.github/workflows/ci.yml`
  (`npm ci` → lint → typecheck → build).
- **Ngoài scope**: chạy test (chưa có, Phase 8 nối vào sau), deploy, E2E.
- **Exit criteria**:
  1. ✅ Workflow chạy xanh trên PR #8 (`feature/phase6-deployment` → `develop`, 2026-08-14) —
     verify lần đầu thành công sau khi maintainer thêm secret `DATABASE_URL`. Lần chạy đầu
     tiên fail với `ECONNREFUSED` (secret chưa tồn tại, Prisma fallback về `127.0.0.1:5432`
     khi prerender `/`) — đúng như dự đoán trong entry Phase 5 ở `docs/CHANGELOG.md`.
  2. ✅ Đã chốt: `DATABASE_URL` là GitHub Actions **repository secret** (không nằm trong file
     workflow), do maintainer tự thêm trên GitHub — assistant không thể tự tạo secret repo.
     Chi tiết ở `docs/CHANGELOG.md`.
  3. ✅ Đo được: lint → typecheck → build đều chạy xanh trên PR #8.
  4. ⏳ Chưa bật — thao tác trên GitHub, do maintainer. Giờ đã có ít nhất 1 lần CI chạy xanh
     nên có thể bật branch protection cho `develop` bất cứ lúc nào.
- **Việc còn lại để đóng phase này**: chỉ còn (4) — maintainer bật branch protection trên
  `develop` yêu cầu check này pass trước khi merge.
- **Vấn đề đã gặp**: `tsc --noEmit` một mình không thấy được `PageProps`/`LayoutProps` (type
  Next.js sinh ra trong `.next/types/` như tác dụng phụ của `build`/`dev`) trên một checkout
  sạch chưa từng chạy build — đúng là tình huống CI gặp phải. Dùng `next typegen` (lệnh có sẵn
  ở Next 16) trước `tsc --noEmit`. Chi tiết ở `docs/LESSONS.md`.

### Phase 6 — Deployment readiness + Vercel ✅ Hoàn thành, đã verify trên production thật (2026-08-14)

- **Mục tiêu**: site chạy thật trên URL Vercel, mỗi PR sinh preview deployment để review.
- **Scope**: tạo Vercel project link repo, env vars production, chiến lược chạy migration khi
  deploy, `error.tsx`/`not-found.tsx`/`loading.tsx`, `next.config.ts` (`images.remotePatterns`
  đặt sẵn cho Cloudinary trước khi Phase 11 cần — đánh số lại 2026-08-21, xem D3).
- **Ngoài scope**: custom domain, analytics, Cloudinary/Resend (chưa có code).
- **Exit criteria**:
  1. ✅ Production URL (`portfolio-with-cms-gilt.vercel.app`) render đủ trang chủ với dữ liệu
     thật từ Neon (hero, featured projects, testimonials) — không có lỗi hay tường auth chắn.
  2. ✅ `/admin` trên production trả về trang login (`Admin login`, Email/Password, Sign in) —
     không lộ dashboard khi chưa đăng nhập.
  3. ✅ Migration production chạy bằng `prisma migrate deploy` qua script `vercel-build`
     (`package.json`) — build production thành công nghĩa là migration đã áp dụng đúng.
  4. ✅ Đã chốt: tách Neon branch/database riêng cho production (maintainer tạo thủ công qua
     Neon console).
  5. ✅ Có `error.tsx` + `not-found.tsx`; route không tồn tại trả về đúng HTTP 404 (không lộ
     stack trace).
  6. ✅ Đã đúng từ trước — mỗi PR (`copilot/fix-lint-typecheck-build`, `feature/phase6-*`, …)
     đều tự sinh preview deployment.
  7. ✅ Xác nhận `MCP_POSTGRES_READONLY_URL` / `CONTEXT7_API_KEY` chưa từng và không được thêm
     vào Vercel (C6).
- **Rủi ro**: copy nguyên `.env` local lên Vercel — kéo theo credential dev tooling lên
  production. Phải liệt kê env production một cách có chủ đích, không copy hàng loạt.
- **Đã chốt**: tách Neon branch/database riêng cho production; SSO protection của Vercel bật
  cho preview, tắt cho production (site public đúng nghĩa portfolio); Vercel production branch
  trỏ sang `develop` thay vì `main` (`main` chưa từng vượt quá commit scaffold ban đầu — xem
  `docs/CHANGELOG.md` Phase 6 để biết lý do và hệ quả với Phase 15 — đánh số lại
  2026-08-21, xem D3).
- **Lưu ý vận hành đã gặp**: đổi Production Branch trên Vercel dashboard **không** tự động
  promote deployment đã build trước đó lên production — phải "Promote to Production" thủ
  công cho deployment có sẵn, hoặc đợi push mới để build lại đúng target. Chi tiết ở
  `docs/CHANGELOG.md`.

### Phase 7 — Markdown renderer (public) ✅ Hoàn thành, đã verify (2026-08-14)

- **Mục tiêu**: `BlogPost.content` hiển thị đúng thay vì raw string như hiện tại.
- **Scope**: một component `<Markdown />` dùng chung (`react-markdown` + `remark-gfm` +
  `rehype-sanitize` + `rehype-highlight`), style bằng SCSS Module, dùng ở `/blog/[slug]`.
  Chốt luôn có áp dụng cho `Project.description` hay không.
- **Ngoài scope**: editor/preview ở admin (Phase 9 dùng lại chính component này).
- **Exit criteria**:
  1. ✅ `rehype-sanitize` có mặt — verify bằng script Node độc lập (không commit) chạy
     đúng pipeline của component với nội dung chứa `<script>` và `<img onerror=...>`:
     cả hai đều bị loại bỏ hoàn toàn khỏi output.
  2. ✅ Heading, list, table (GFM), code block, link render đúng — verify trên cùng
     script test.
  3. ✅ Link ra ngoài có `rel="noopener noreferrer"`; `target="_blank"` chỉ áp dụng cho
     link ngoài (`http`), không gắn thừa vào link nội bộ.
  4. ✅ Không dùng `dangerouslySetInnerHTML` — verify bằng `grep -r dangerouslySetInnerHTML
     src/`, không có kết quả nào.
  5. ✅ Đã chốt: áp dụng cho cả `BlogPost.content` và `Project.description`.
- **Rủi ro**: lập luận "content do admin nhập nên tin được" → bỏ sanitize. Vẫn phải sanitize:
  defense-in-depth, phòng khi sau này có nguồn nhập khác (import, seed, API).
- **Chi tiết**: `docs/CHANGELOG.md` Phase 7; quyết định thứ tự plugin `rehype-sanitize` /
  `rehype-highlight` ghi ở `docs/LESSONS.md`.

### Phase 8 — Test foundation (Vitest) ✅ Hoàn thành, đã verify (2026-08-14)

- **Mục tiêu**: có sẵn chỗ viết test **trước** khi CRUD ra đời, để phần rủi ro nhất của dự án
  được viết kèm test ngay từ đầu.
- **Scope**: Vitest + config, vài test thật cho `queries.ts` và cho helper auth, nối vào
  workflow CI của Phase 5.
- **Ngoài scope**: E2E/Playwright, ngưỡng coverage.
- **Exit criteria**:
  1. ✅ `npm run test` (`vitest run`) chạy được ở local; thêm bước `Test` vào
     `.github/workflows/ci.yml` giữa `typecheck` và `build`.
  2. ✅ `src/lib/queries.test.ts` mock `@/lib/prisma`, chứng minh `getPublishedProjects` /
     `getProjectBySlug` (và các query public khác trong file) luôn gọi Prisma với
     `status: "PUBLISHED"`.
  3. ✅ Đã chốt: mock Prisma thay vì DB test thật — lý do và đánh đổi ghi ở
     `docs/LESSONS.md`.
- **Rủi ro**: mock Prisma thì test không bắt được lỗi query thật; DB thật thì cần thêm hạ
  tầng cho CI. Đây là đánh đổi có ý thức — đã ghi lại ở `docs/LESSONS.md`, không chọn im
  lặng.
- **Chi tiết**: `docs/CHANGELOG.md` Phase 8.

### Phase 9 — Admin CRUD ✅ Hoàn thành, đã verify trên production thật (2026-08-21)

Phase lớn nhất. Nên chia nhỏ theo model: làm `Project` trước cho ra pattern, rồi nhân bản.

- **Mục tiêu**: quản lý `Project`, `BlogPost`, `Skill`, `ExperienceEntry`, `Testimonial`,
  `SiteSettings`; xem và đánh dấu đã đọc `ContactMessage`.
- **Scope**: scaffold thêm shadcn primitives thực sự cần (form, input, textarea, select,
  table, dialog, toast), server actions, Zod schema dùng chung client/server,
  `react-hook-form` + `@hookform/resolvers`, `@tanstack/react-table` cho list view, tách
  `src/lib/admin/*` (C4), revalidate sau mutation (C3), Zod cho `socialLinks` (C5).
- **Ngoài scope**: upload ảnh (Phase 11 — đánh số lại, xem D3) — form tạm nhận URL dạng text.
- **Exit criteria** (áp dụng cho toàn phase — đạt được cho `Project`/`BlogPost`/
  `Skill`/`ExperienceEntry`/`Testimonial`/`SiteSettings` ở sáu slice CRUD; `ContactMessage`
  thuộc mục tiêu phase nhưng không tính vào 6 slice CRUD model):
  1. ✅ (cả sáu model) **Mọi** server action bắt đầu bằng auth check, không phụ thuộc
     middleware (C1) — verify bằng test (`actions.test.ts`) mock `@/auth` trả `null`.
  2. ✅ (cả sáu model) Validate bằng Zod ở server **kể cả khi** client đã validate —
     `zodResolver(..., { raw: true })` ở client, `safeParse` lại độc lập ở server action.
  3. ✅ (`Project`, `BlogPost`, `Testimonial`) Đọc DRAFT chỉ đi qua `src/lib/admin/
     {projects, blog-posts, testimonials}.ts`; `src/lib/queries.ts` không đổi, không có
     tham số nào bỏ qua filter PUBLISHED (C4) — verify bằng test. Không áp dụng cho
     `Skill`/`ExperienceEntry`/`SiteSettings` (không có DRAFT/PUBLISHED).
  4. ✅ Publish/unpublish invalidate đúng trang public tương ứng — `revalidatePath` trong
     `actions.ts` của từng model, verify bằng tay trên production thật (2026-08-21):
     publish/unpublish `Project` và `BlogPost` phản ánh ngay trên `/projects`/`/blog` không
     cần rebuild, và đổi `SiteSettings.siteName` phản ánh ngay trên mọi route public.
     `SiteSettings` dùng `revalidatePath("/", "layout")` (không phải một path đơn) vì
     `siteName` render qua layout public trên mọi route.
  5. ✅ `socialLinks` đi qua Zod (C5) — `src/lib/social-links.ts`, dùng ở cả biên đọc
     (`getSocialLinks()` trong `queries.ts`) lẫn biên ghi (form + action của
     `SiteSettings`).
  6. ✅ (`Project`, `BlogPost`, `Skill`, `ExperienceEntry`, `Testimonial`) Thao tác xoá
     có bước xác nhận — `AlertDialog` trên mỗi hàng ở list view. Không áp dụng cho
     `SiteSettings` (singleton, không có xoá).
  7. ✅ (cả sáu model) Lỗi server action trả về thông báo dùng được cho người dùng
     (`{error: string}`), không ném raw error ra UI.
- **Rủi ro**: phase phình to rồi merge một PR khổng lồ không review nổi. Chia theo model,
  mỗi model một PR — đã làm đúng cho `Project`, `BlogPost`, `Skill`, `ExperienceEntry`,
  `Testimonial`, `SiteSettings`, và cho `ContactMessage` (PR #21).
- **Chi tiết**: `docs/CHANGELOG.md` Phase 9 (từng slice); quyết định kỹ thuật (Server Action
  qua ranh giới Server/Client Component, gap `z.coerce.number()` với input rỗng, gap
  `new Date()` roll-over ngày không hợp lệ) ghi ở `docs/LESSONS.md`. Plan riêng cho
  `ContactMessage` ở `docs/superpowers/specs/2026-08-21-phase9-contact-messages-plan.md`.

### Phase 10 — UI/UX Overhaul (public + admin) ✅ Hoàn thành, đã merge vào `develop` (2026-08-24)

Kế hoạch chi tiết đầy đủ (7 phát hiện nền, kiến trúc token, theme switching, hệ thống motion,
redesign từng trang public, extraction + rebuild admin, danh sách 19 PR gốc) ở
`docs/superpowers/specs/2026-08-21-phase10-ui-ux-overhaul-design.md` — không lặp lại ở đây.
Chi tiết từng PR đã xong: `docs/CHANGELOG.md` (entry "Phase 10 (PR 1–10 of 19)" và "Phase 10
(PR A–D)").

**Việc còn lại, chưa chặn phase tiếp theo:** PR D (#39) tự ghi lại 2 mục chưa làm được vì
không có browser trong session đó — đi bằng bàn phím/screen reader thật xuyên toàn bộ admin,
và đo contrast bằng mắt cho `AdminStatCard` tone warning + các section dashboard mới, cả hai
theme. Chưa xác nhận đã làm; ghi ở đây để không quên, không phải chặn Phase 11+.

**Tiến độ (PR 0–10, tất cả đã merge):**

| # | Branch | PR | Xong gì |
|---|---|---|---|
| 0 | `docs/phase9-close-out-and-phase10-renumber` | #23 | Chèn Phase 10 vào file này, dồn số 10–14 cũ → 11–15 |
| 1 | `feature/phase10-tokens` | #24 | Token foundation (motion/elevation/focus/surface/container/z-index), sửa drift radius 12px→10px |
| 2 | `feature/phase10-theming` | #25 | Mount `ThemeProvider` thật, bỏ hardcode `dark`, sửa bug `Toaster` |
| 3 | `feature/phase10-palette` | #26 | Ramp oklch (neutral/brand/accent), remap semantic var, sửa `--border` dark trong suốt, `--syntax-*`, font heading thật |
| 4 | `feature/phase10-motion` | #27 | Thêm dep `motion`, `LazyMotion`+`MotionConfig` ở root, card-lift, nav-scroll-state |
| 5 | `feature/phase10-public-shell` | #28 | Skip-link, `SiteFooter`, mobile nav, `(public)/not-found.tsx` trong shell |
| 6 | `feature/phase10-public-primitives` | #29 | `RemoteImage`, `EmptyState`, `format-date.ts`, `(public)/loading.tsx` |
| 7 | `feature/phase10-home` | #30 | Redesign home: hero streaming qua Suspense, motion primitives có consumer đầu tiên |
| 8 | `feature/phase10-projects` | #31 | Redesign `/projects` (grid) + `/projects/[slug]`, `ArticleSkeleton` dùng chung |
| 9 | `feature/phase10-blog` | #32 | Redesign `/blog` (list theo ngày) + `/blog/[slug]`, markdown qua `heading()` |
| 10 | `feature/phase10-about` | #33 | Avatar, skill/experience group theo category/type, `formatDateRange`, `groupBy()` mới |

**Tiến độ (PR A–D — gộp lại từ 8 PR 11–18 cũ thành 4 để giảm review overhead, chi tiết ở spec
§10.1):**

| PR | Branch | PR # | Xong gì |
|---|---|---|---|
| A | `feature/phase10-admin-shell-login` | #36 | Admin shell (sidebar/topbar/user-menu/error boundary), redesign `/admin/login` bằng `Field`/`Input` |
| B | `feature/phase10-admin-list-views` | #37 | `AdminPageHeader`/`AdminBreadcrumbs`/`AdminEmptyState`/`StatusBadge` áp lên 18 trang; `AdminDataTable` (tanstack table v9) thay 6 bảng tự viết |
| C | `feature/phase10-admin-forms` | #38 | `AdminFormShell`/`useAdminForm` (sửa bug "lưu thành công không thấy gì"); `TagsInput`/`UrlListInput`/`slugify`/toolbar markdown |
| D | `feature/phase10-admin-dashboard-audit` | #39 | Dashboard thật (stat card/needs-attention/quick actions); audit a11y tĩnh (không có browser), sửa 2 bug focus/ARIA thật |

Tất cả 4 PR (A–D) đã merge — 15 PR thực tế đã mở cho toàn Phase 10 (0–10 cộng A–D), thay 19 PR
gốc trong spec nhờ gộp 8 PR admin cuối (11–18) thành 4 (xem §10.1 và entry changelog "Phase 10
— remaining admin PRs (11–18) consolidated to 4 (A–D)").

- **Mục tiêu một dòng**: design system thật (một nguồn sự thật cho token), bản sắc thị giác
  riêng thay vì default shadcn, light+dark chạy thật với toggle, hiệu ứng có chủ đích, admin
  hết duplicate (30 file SCSS → ~14 file dùng chung), a11y baseline đạt trên mọi trang.
- **Vì sao chen vào đây**: Phase 11 (upload), 12 (contact form), 13 (SEO/OG) đều thêm UI
  mới — có design system + admin primitives trước thì ba phase đó xây lên nền có sẵn thay vì
  phải sửa lại UI ba lần.
- **Ngoài scope**: bất kỳ tính năng mới nào (upload ảnh thật, contact form thật, SEO đọc từ
  DB) — đây thuần là redesign + hạ tầng, không thêm khả năng.
- **Rủi ro chính đã ghi trong spec**: animate opacity của hero `<h1>` sẽ trễ phép đo LCP
  (không bao giờ làm); `:root`/`.dark` cùng specificity nên thứ tự nguồn trong `globals.css`
  quyết định theme nào thắng; CSS Modules scope tên `@keyframes` nên animation dùng chung
  phải emit qua `@at-root` trong mixin.

### Phase 11 — Image upload (Cloudinary)

- **Mục tiêu**: upload ảnh cho `coverImageUrl`, `galleryUrls`, `avatarUrl`, `heroImageUrl`,
  `ogImageUrl` từ form admin.
- **Scope**: endpoint ký upload phía server, component upload ở form admin, hiển thị ảnh
  bằng `next/image`.
- **Ngoài scope**: media library/quản lý ảnh độc lập với record.
- **Exit criteria**:
  1. Chữ ký tạo ở server; `CLOUDINARY_API_SECRET` không bao giờ tới client.
  2. Tham số ký giới hạn định dạng, kích thước tối đa và folder đích — không ký một upload
     tuỳ ý.
  3. Endpoint ký chỉ gọi được khi đã đăng nhập.
  4. `images.remotePatterns` đã whitelist đúng domain Cloudinary.
  5. Chốt và ghi lại: có xoá ảnh trên Cloudinary khi xoá record hay chấp nhận để lại rác.
- **Rủi ro**: ký upload không giới hạn = biến tài khoản Cloudinary thành kho chứa file công
  cộng cho bất kỳ ai lấy được chữ ký.

### Phase 12 — Contact form + email ✅ Hoàn thành, verify bằng submit thật qua browser (2026-08-24)

> Branch phase này tạo từ `develop` **trước khi PR Phase 11 merge** — xem PR #42, đang
> review riêng. Không phụ thuộc lẫn nhau (image upload vs contact form), nên không chặn.

- **Mục tiêu**: khách gửi form public → ghi `ContactMessage` + notify qua Resend.
- **Scope**: form public, server action, Zod, honeypot + rate limit, gửi mail qua Resend tới
  `CONTACT_NOTIFICATION_EMAIL`.
- **Ngoài scope**: trả lời/quản lý hội thoại; chỉ đọc và đánh dấu đã đọc (Phase 9, đã xong).
- **Exit criteria**:
  1. ✅ Validate bằng Zod ở server (`src/lib/contact-schema.ts`, `safeParse` trong action) —
     đây là endpoint ghi DB **công khai** đầu tiên trong repo.
  2. ✅ Honeypot (field ẩn, không nằm trong schema chính, action trả `{ok:true}` giả khi dính
     bẫy — verify bằng browser thật: action chạy 2ms, không đụng Prisma/Resend) **và** rate
     limit theo IP (3 submit/giờ, `createRateLimiter()` dùng chung với login — verify bằng
     browser thật: submit thứ 4 trong giờ bị chặn, giữ nguyên input đã nhập).
  3. ✅ Resend lỗi thì `ContactMessage` vẫn được lưu — verify bằng browser thật với
     `RESEND_API_KEY` rỗng (lỗi thật, không phải giả lập): message vẫn xuất hiện đúng trong
     `/admin/contact-messages`, người gửi vẫn thấy "Message sent."
  4. ✅ Không nội suy input người dùng vào header email — `from`/`subject` hardcode tĩnh,
     chỉ `replyTo` dùng email đã qua Zod validate; subject người dùng gõ nằm trong **body**.
  5. ✅ `RESEND_API_KEY`/`CONTACT_NOTIFICATION_EMAIL` chỉ đọc trong `actions.ts`.
  6. ✅ Loading/success/error rõ ràng ở `contact-form.tsx` — verify bằng browser thật cả 3
     trạng thái (submit hợp lệ, lỗi validate client-side, lỗi rate-limit server-side).
- **Rủi ro đã gặp/sửa lúc self-review** (trước khi verify browser): honeypot CSS ban đầu dùng
  `left: -9999px` có thể làm rộng vùng cuộn trang — đổi sang mixin `visually-hidden` (kỹ
  thuật clip) kết hợp `aria-hidden`+`tabIndex={-1}` (chi tiết `docs/LESSONS.md`); field
  `subject` có validate max-length nhưng UI ban đầu không hiển thị lỗi — đã bổ sung.

### Phase 13 — SEO

Tách hai nửa vì phụ thuộc khác nhau:

- **13a (cơ học — không phụ thuộc CRUD, có thể kéo lên ngay sau Phase 6)**: `robots.ts`,
  `sitemap.ts`, `generateMetadata` per-page, Open Graph cơ bản.
- **13b (cần CRUD)**: đọc `seoTitle` / `seoDescription` / `ogImageUrl` từ DB, fallback về
  `SiteSettings.defaultSeoTitle` / `defaultSeoDescription`.
- **Exit criteria**:
  1. `sitemap.ts` chỉ liệt kê nội dung `PUBLISHED` (dùng lại `queries.ts`, không query riêng).
  2. Mỗi trang có title/description riêng, không dùng chung metadata tĩnh của layout.
  3. OG image hợp lệ, kích thước đúng chuẩn.
  4. `robots.ts` không chặn nhầm production và **không** để `/admin` lọt vào sitemap.
- **Rủi ro**: `sitemap.ts` viết query riêng thay vì dùng `queries.ts` → rò rỉ URL của bài
  DRAFT ra công cụ tìm kiếm.

### Phase 14 — A11y + responsive polish (audit cuối)

A11y baseline chính đã dồn vào Phase 10 (D2, xem spec) — phase này co lại thành một lần rà
soát cuối sau khi mọi tính năng (upload, contact form, SEO) đã ổn định, không phải nơi a11y
được làm lần đầu.

- **Mục tiêu**: rà soát chất lượng UI toàn site sau khi tính năng đã ổn định.
- **Exit criteria**:
  1. Đi hết được nav public và form admin chỉ bằng bàn phím; focus luôn nhìn thấy được.
  2. Contrast đạt WCAG AA trên cả hai theme (light + dark, từ Phase 10).
  3. Mọi input có `<label>` liên kết đúng; lỗi validation được đọc bởi screen reader.
  4. Ảnh có `alt` (rỗng có chủ đích cho ảnh trang trí).
  5. Kiểm tra mobile / tablet / desktop trên preview deployment thật.
- **Rủi ro**: nếu Phase 10 không thật sự làm a11y baseline như đã chốt (D2) thì phase này lại
  phải làm lại từ đầu — không chỉ audit.

### Phase 15 — Release

- **Exit criteria**: CI xanh trên `develop`; merge `develop` → `main`; production chạy từ
  `main`; `docs/CHANGELOG.md` và file này cập nhật xong.

## Nợ kỹ thuật đã chấp nhận (quyết định, không phải bỏ sót)

- **Tailwind ở các trang public Phase 1**: Phase 2 đã convert 6 trang public sang SCSS
  Modules. Phần Tailwind còn lại chủ yếu thuộc `shadcn/ui` — vốn *nên* giữ nguyên theo rule
  styling trong `CLAUDE.md`. **Không lên lịch phase refactor**; nếu về sau còn utility class
  lẻ ngoài `shadcn/ui`, dọn tại chỗ khi đụng vào file đó.

---

Mỗi phase khi thực sự bắt đầu vẫn đi qua quy trình trong `CLAUDE.md`: branch riêng từ
`develop` (`feature/phase<N>-<name>`), Analyze → Plan → Implement → Verify → Review, và cập
nhật `docs/CHANGELOG.md`/`docs/LESSONS.md` khi xong. File này chỉ đánh dấu phase đã
bắt đầu/hoàn thành — không lặp lại chi tiết implementation.

Kế hoạch chi tiết gốc của Phase 3 không lặp lại ở đây nữa — xem lịch sử git của file này
(`git log -p -- docs/ROADMAP.md`) hoặc entry Phase 3 ở `docs/CHANGELOG.md`.

## Cách cập nhật file này

Khi một phase mới bắt đầu hoặc hoàn thành: cập nhật mục "Đã hoàn thành", bảng snapshot (xoá
dòng đã được implement), và mục phase tương ứng — không viết lại toàn bộ file. Khi một quyết
định cross-cutting được chốt thật trong code, cập nhật cột "Hướng đã chốt" của bảng C1–C6
kèm link tới entry `docs/CHANGELOG.md` tương ứng.
