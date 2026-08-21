# Phase 10 — UI/UX Overhaul (public + admin)

- **Ngày chốt thiết kế**: 2026-08-21
- **Trạng thái**: 📋 Đã chốt thiết kế — **chưa bắt đầu implement**
- **Điều kiện khởi động**: Phase 9 phải đóng xong trước (xem §0)
- **Branch convention**: `feature/phase10-<name>`, mỗi slice một PR, đều nhánh từ `develop`

---

## 0. Cổng chặn — Phase 9 chưa đóng

Kiểm tra ngày 2026-08-21 (verify bằng code, không phải đọc doc):

| Việc | Trạng thái |
|---|---|
| PR #18 (`feature/phase9-admin-crud-sitesettings`) | ✅ **Đã merge** vào `develop` (`c0f3cb3`); PR #19 fix advisory lock merge sau (`d723a2c`) |
| 6 slice CRUD model (Project, BlogPost, Skill, ExperienceEntry, Testimonial, SiteSettings) | ✅ Xong |
| `ContactMessage` (xem + đánh dấu đã đọc) | ❌ **Chưa có dòng code nào** — model tồn tại ở `prisma/schema.prisma:126` nhưng `grep -ri "contact-message" src/` không ra kết quả nào ngoài generated Prisma |
| Exit criterion 4 — verify `revalidatePath` trên preview deployment thật | ⏳ Chưa verify |

→ **PR #18 là slice cuối của phần *model CRUD*, không phải điểm đóng Phase 9.** Phase 10 không bắt đầu cho tới khi hai mục trên xong.

**Hệ quả cần biết trước:** khi maintainer làm `ContactMessage` bằng pattern hiện tại, nó sẽ thành **bản duplicate thứ 6** (thêm một `*-table.module.scss` giống hệt 5 file kia, thêm một `*-table.tsx` ~150 dòng gần trùng). Đó là chấp nhận được và **có chủ đích**: Phase 10 dọn cả 6 một lượt, và `ContactMessage` chính là phép thử tốt nhất cho `AdminDataTable` vì nó là model duy nhất *không* do tác giả kiểm soát số dòng.

---

## 1. Context — vì sao có phase này

### Vấn đề

Site chạy đúng chức năng nhưng **đọc như output mặc định của template**, và mọi thay đổi UI đều đắt hơn mức cần thiết. Bảy phát hiện đã verify:

**A. Không có design system thật — có *hai* hệ token song song không giao nhau.**
Màu chỉ sống ở CSS vars trong `src/app/globals.css` (nguyên bản shadcn neutral + primary violet `oklch(0.65 0.18 264)`; `--chart-1..5` vẫn grayscale mặc định). Spacing/font-size/breakpoint chỉ sống ở SCSS — `src/styles/_variables.scss` **25 dòng**. Thiếu hoàn toàn: elevation, motion token, focus-ring, line-height/tracking scale, surface layer trung gian.
Có **drift thật đang tồn tại**: `--radius: 0.625rem` (10px) trong `globals.css` vs `$radius-lg: 0.75rem` (12px) trong `_variables.scss` — hai con số cùng tự nhận là một token.

**B. Light theme tồn tại nhưng không thể tới được — và có bug thật.**
`src/app/layout.tsx:24` hardcode `className="dark ..."`. Bộ token `:root` (light) đầy đủ nằm trong `globals.css` nhưng không đường nào chạm tới. `next-themes` đã cài, và `src/components/ui/sonner.tsx:3` **gọi `useTheme()` nhưng không có `ThemeProvider` nào được mount** — đang bị che vì `src/app/admin/(protected)/layout.tsx:29` hardcode `<Toaster theme="dark" />`.

**C. Admin: 25 / 30 file SCSS là bản sao byte-identical** (verify bằng `md5sum`, 4 nhóm):

| Nhóm | Số file |
|---|---|
| `{5 model}/new/page.module.scss` + `{5 model}/[id]/edit/page.module.scss` + `settings/page.module.scss` | **11 identical** |
| `{5 model}/<model>-table.module.scss` (61 dòng × 5) | **5 identical** |
| `{5 model}/page.module.scss` (list) | **5 identical** |
| `{experience,settings,skills,testimonials}/<model>-form.module.scss` | **4 identical** |

Cộng 5 file `*-table.tsx` (~130–174 dòng) gần trùng. **Không có `src/components/admin/`** — chưa từng extract gì. Mọi sửa UI admin = sửa 5 lần.

**D. Admin UX thiếu nền tảng.** Nav phẳng 7 `<Link>` **không có active state** (public nav thì có); không mobile nav, không breadcrumb, form không back-link; dashboard chỉ có `Signed in as {email}` + Sign out, và dùng **sai mixin** (`page-container` 768px thay vì `admin-page-container` 960px); table không pagination/search/filter; status là plain text; empty state là một dòng `<p>`; **không có `loading.tsx`/skeleton ở bất kỳ đâu**; `/admin/login` không dùng shadcn `Input`/`Field` mà raw `<input>` riêng.

**E. Public: không render một tấm ảnh nào.** 0 occurrence của `next/image` hoặc `<img>` trong toàn `src/`. Nhưng DB + admin form đã có `Project.coverImageUrl`/`galleryUrls`, `BlogPost.coverImageUrl`, `SiteSettings.heroImageUrl`/`avatarUrl`, `Testimonial.authorAvatarUrl`, `Skill.iconUrl`; `next.config.ts` đã whitelist `res.cloudinary.com`. **Không cần chờ phase upload để render.**

**F. Public UX.** Không footer, không mobile menu (3 link inline ở mọi viewport), không empty state, `/blog/[slug]` không có ngày/tag/back-link, `/about` không group skill theo `category` (field có sẵn), single-column ở mọi breakpoint — `respond-to("md")` dùng đúng 4 chỗ, `lg`/`xl` chưa từng dùng.

**G. A11y.** `:focus-visible` xuất hiện **đúng 1 lần trong toàn repo** (`src/app/admin/login/page.module.scss:44`). Không skip-link, không `prefers-reduced-motion`, `aria-current` ở site-nav là ARIA duy nhất của public.

### Vì sao chen vào đây, không để tới Phase 13 cũ

Phase 11 (upload), 12 (contact form), 13 (SEO/OG) — theo số mới — **đều thêm UI mới**. Có design system + admin primitives trước thì ba phase đó xây lên nền có sẵn. Làm sau thì phải sửa lại UI của cả ba, và nhân bản thêm nợ mỗi lần.

### Kết quả mong muốn

Một design system thật (một nguồn sự thật cho token), bản sắc thị giác riêng thay vì default shadcn, light+dark chạy thật với toggle, hiệu ứng có chủ đích, admin không còn duplicate, và a11y baseline đạt trên mọi trang.

---

## 2. Quyết định đã chốt với maintainer

| # | Quyết định | Ghi chú |
|---|---|---|
| D1 | **Redesign bản sắc + systematize**, gồm hiệu ứng UI phong phú | Không phải chỉ "dọn dẹp" — palette/typography/layout đổi thật |
| D2 | **Hấp thụ a11y baseline** vào phase này | Phase 13 cũ co lại thành audit cuối (số mới: 14) |
| D3 | **Đánh số Phase 10**, dồn 10–14 cũ → 11–15 | An toàn: 10–14 cũ chưa có dòng code hay entry CHANGELOG nào |
| D4 | **Light theme thật + toggle** | Mount `ThemeProvider`, bỏ hardcode `dark`, sửa bug Toaster |
| D5 | **Dùng `motion` (framer-motion) làm hạ tầng animation** | Maintainer chọn có ý thức sau khi được nêu đánh đổi |
| D6 | **Component/page lớn có file `.module.scss` riêng, colocate** | Đúng convention `CLAUDE.md` sẵn có |
| D7 | **Không bắt đầu implement cho tới khi Phase 9 đóng** | Xem §0 |

### Đính chính về D5 (quan trọng)

Lúc hỏi, tôi cảnh báo `motion` sẽ **ép `"use client"` lan ra các public page đang là RSC**. Verify lại docs chính thức thì **cảnh báo đó sai**:

- `motion` export sẵn **`motion/react-client`** — dùng `import * as motion from "motion/react-client"` thì `<motion.div>` chạy **ngay trong Server Component**, không cần `"use client"`. Public pages **giữ nguyên RSC**.
- `LazyMotion` + `domAnimation` + `m` (`motion/react-m`) hạ bundle xuống **~4.6kb** thay vì full.
- `MotionConfig reducedMotion="user"` là **chốt a11y tập trung** — mặc định là `"never"` nên **bắt buộc phải set**.
- Motion có **trang tích hợp Base UI chính thức** — đúng nền `@base-ui/react` mà shadcn ở repo này đang chạy, nên `AnimatePresence` dùng được với `AlertDialog`/`Select`/`DropdownMenu`.

Chi phí thật còn lại: **một dependency mới** (~34kb full, ~4.6kb qua `LazyMotion`) và một API surface nữa phải học. Đánh đổi này maintainer đã chấp nhận.

---

## 3. Kiến trúc token — giải quyết chỗ tách đôi

### Quy tắc sở hữu (một *rule*, không phải một *cơ chế*)

Không cơ chế đơn lẻ nào sống sót qua ràng buộc thực tế:

| Ràng buộc | Hệ quả |
|---|---|
| `@media` không đọc được custom property | breakpoint **buộc** ở SCSS |
| Theme đổi lúc runtime | màu **buộc** là CSS var |
| Tailwind `@theme inline` / shadcn chỉ đọc CSS var | mọi token shadcn nhìn thấy **buộc** là CSS var |
| `motion` là JS, đọc số JS | duration/easing **cần thêm** bản JS |
| SCSS math / `@for` / map lookup | những token đó **buộc** ở SCSS |

> **Rule:** token sống ở **CSS custom property** nếu giá trị phải đổi lúc runtime (theme) hoặc phải được Tailwind/shadcn đọc. Sống ở **SCSS `$variable`** nếu tĩnh *và* cần lúc build (media query, SCSS math). Với token do CSS var sở hữu mà SCSS Module cần dùng, `_variables.scss` expose **alias mỏng** `$x: var(--x)` — component SCSS chỉ có một cửa import và không bao giờ gõ `var()` thô, giá trị vẫn nằm đúng một chỗ.

Alias chính là thứ biến đây thành single source of truth thật chứ không phải "chỗ tách đôi có tài liệu": `$radius-lg: var(--radius-lg)` hoạt động ở mọi vị trí SCSS Module đang dùng, và **xoá luôn drift 10px/12px đang tồn tại**.

**Đã cân nhắc và loại:**
- *SCSS emit ra CSS vars* (file global thứ hai): cần kỷ luật thứ tự load giữa hai file cùng ghi `:root`; `:root`/`.dark` cùng specificity nên lỗi thứ tự im lặng. Không được gì thêm so với alias.
- *CSS var là nguồn duy nhất, SCSS đọc hết qua `var()`*: gãy breakpoint, gãy `respond-to()`, gãy `@for` stagger, gãy `math.div`.
- *Sass function `token()` bọc map lookup*: thêm một lớp gián tiếp, không đổi lại được gì so với `vars.$name`.

### Nhóm token mới và chỗ ở

**`src/styles/_variables.scss`** (tĩnh / build-time — mở rộng, không đập đi):

```
containers   $container-prose 44rem · $container-page 48rem · $container-wide 72rem · $container-admin 60rem
spacing      + $spacing-3xl 4rem · $spacing-4xl 6rem
type         + $font-size-xs .75rem · $font-size-4xl 3rem
             + $font-size-display clamp(2.25rem, 6vw, 4.5rem)   (chỉ hero)
leading      $leading-tight 1.15 / -snug 1.3 / -normal 1.5 / -relaxed 1.7
tracking     $tracking-tighter -.03em / -tight -.015em / -normal 0 / -wide .04em
z-index      $z-sticky 100 / $z-dropdown 200 / $z-overlay 300 / $z-toast 400 / $z-skip 500
             (thay magic `z-index: 10` trong site-nav.module.scss)
alias →      $radius-sm|md|lg|xl · $font-family-sans|mono|heading
             $duration-* · $ease-* · $elevation-1|2|3 · $focus-ring-*
```

**`src/app/globals.css`** (runtime / theme-varying / shadcn-facing — thêm vào **cả** `:root` và `.dark`):

```
motion       --duration-instant 80ms · --fast 150ms · --base 250ms · --slow 400ms · --slower 700ms
             --ease-out / --ease-in-out / --ease-emphasized  (cubic-bezier)
             --motion-distance-sm 8px / -md 16px / -lg 32px
elevation    --shadow-umbra · --shadow-penumbra  (theme-dependent, ám sắc theo hue brand)
             --elevation-1 / -2 / -3
focus        --focus-ring-width 2px · --focus-ring-offset 2px · --focus-ring-color var(--ring)
surfaces     --surface · --surface-raised · --surface-sunken · --surface-overlay
             (thêm *bên cạnh* card/muted của shadcn, không thay thế)
syntax       --syntax-keyword|string|comment|number|title|deletion
primitives   --brand-50…950 · --accent-50…950 · --neutral-0…1000  (ramp, xem §4)
```

**`src/styles/motion.ts`** (mới — bản JS của motion token, để `motion` đọc):

```ts
export const duration = { instant: 0.08, fast: 0.15, base: 0.25, slow: 0.4, slower: 0.7 } as const;
export const ease = { out: [0.16, 1, 0.3, 1], inOut: [0.65, 0, 0.35, 1], emphasized: [0.2, 0, 0, 1] } as const;
export const distance = { sm: 8, md: 16, lg: 32 } as const;
```

Đây là **chỗ duy nhất** đáng chấp nhận trùng lặp giá trị giữa CSS và JS (CSS var không đọc được từ JS mà không `getComputedStyle`). Giữ đồng bộ bằng comment chéo ở cả hai file + một test (§12).

### Hai cái bẫy phải chốt từ đầu

1. **`:root` và `.dark` cùng specificity (0,1,0)** — dark chỉ thắng nhờ thứ tự nguồn. Mọi block token mới append vào `globals.css` **phải giữ `.dark` ở cuối**. Có comment *và* test tự động (§12).
2. **CSS Modules scope tên `@keyframes`.** Một module viết `animation-name: rise-in` trỏ tới keyframes khai báo ở `globals.css` sẽ bị hash lại tên và **hỏng im lặng**. Cách xử lý: mixin animation tự emit keyframes của nó qua `@at-root` bên trong mixin — scope cục bộ, tự nhất quán, không cần `:global()`.

### Mixin mới — `src/styles/_mixins.scss`

```
respond-below($name)             max-width counterpart — cần cho mobile nav
container($max: $container-page) tổng quát hoá; page-container / admin-page-container delegate vào
heading($level)                  size+weight+leading+tracking+family từ một map
                                 (xoá bộ ba font-size/font-weight/letter-spacing đang copy-paste ở 6 page module)
focus-ring($offset)              baseline a11y, một định nghĩa duy nhất
visually-hidden                  skip-link, section label
hoverable                        @media (hover:hover) and (pointer:fine) { &:hover { @content } }
motion-safe                      @media (prefers-reduced-motion: no-preference) { @content }
elevation($level)
aspect-media($ratio: 16/9)       relative + aspect-ratio + overflow + bg --muted + img{object-fit:cover}
grid-auto($min: 18rem, $gap)     repeat(auto-fill, minmax($min,1fr)) — responsive không cần media query
skeleton                         --muted + pulse trong motion-safe
```

Nâng cấp tại chỗ: `card`/`card-link` (elevation + transform + `hoverable` + `focus-ring`), `button-pill` (focus-ring, active press), `pill` (giữ nguyên).

---

## 4. Palette + typography — phần cơ học

### Màu hai lớp: primitive → semantic

Thêm **ramp oklch cố định hue** làm primitive, rồi trỏ lại mọi semantic var của shadcn vào một bậc ramp. **Không bao giờ xoá hay đổi tên một biến shadcn nào** — chỉ đổi giá trị. Đó là thứ giữ cho `Button`/`Select`/`AlertDialog`/`Sonner` không vỡ.

- Chọn một hue brand `H_b` và một accent (analogous ~+40° hoặc complementary ~+160°). **Tối đa hai hue.**
- **Ramp neutral mang chroma 0.006–0.012 tại `H_b`.** Riêng thay đổi này là phần lớn thứ khiến site thôi đọc như "shadcn mặc định" — bề mặt xám tuyệt đối chính là dấu hiệu nhận biết.
- Cùng một thang lightness cho mọi ramp (ví dụ `0.99 0.97 0.94 0.88 0.78 0.66 0.55 0.45 0.35 0.25 0.16`), chroma đạt đỉnh giữa ramp để bậc brand không rơi ra ngoài gamut sRGB. Thang L giống nhau nghĩa là **đổi hue sau này không thể làm đổi bất kỳ tỉ lệ contrast nào**.
- **Sửa `--border: oklch(1 0 0 / 10%)` ở dark** → một bậc ramp đục. `@layer base` áp `border-border` lên `*`, nên border trong suốt composite khác nhau trên `card` vs `background` và đọc ra không nhất quán.
- **`--chart-1..5` giữ grayscale + comment "unused shadcn default"** — nhưng **chỉ sau khi** `markdown.module.scss` thôi mượn `--chart-2`/`--chart-4` làm syntax highlight. Coupling ẩn đó nghĩa là một bảng màu chart trong tương lai sẽ âm thầm đổi màu code block. Chuyển sang `--syntax-*`, sửa một file.

### Verify contrast AA

Không có cách zero-dep để gate trong `npm run test` (oklch→sRGB→relative luminance ~40 dòng nợ bảo trì; thêm thư viện màu là thêm dependency).

- **Lúc thiết kế:** lightness oklch là số hạng chi phối. Heuristic làm *điểm xuất phát*, không phải khẳng định: chữ trắng cần khoảng `L(bg) ≤ 0.60`; chữ gần đen cần khoảng `L(bg) ≥ 0.72`. Lưu ý `--primary` hiện tại **đáng ngờ ở cả hai phía** — nên `--primary-foreground` phải chọn riêng cho từng theme, và hai theme được phép có lightness primary khác nhau.
- **Verify:** chạy trong browser qua Chrome MCP `javascript_tool` — duyệt text node, lấy fg/bg hiệu dụng từ `getComputedStyle`, tính tỉ lệ WCAG, báo cáo chỗ fail. Một lượt cho mỗi theme, mỗi trang. Zero dep trong repo.
- **Lưu vết:** bảng contrast (cặp màu → tỉ lệ → pass/fail) trong PR description, **cả hai theme**. Đó mới là artifact reviewer kiểm, không phải một test xanh.

### `--font-heading` thành font thật

Hiện `--font-heading` chỉ alias `--font-sans` — đó là nửa còn lại của cảm giác "template".

- `src/app/layout.tsx`: thêm một family `next/font/google` với `variable: "--font-display"`, `subsets: ["latin"]`, **chỉ những weight thật sự dùng (tối đa 2)**.
- `globals.css`: `@theme inline { --font-heading: var(--font-display); }`; `_variables.scss` alias `$font-family-heading`; chỉ tiêu thụ qua `heading()`.
- **Chi phí thật:** ~20–45 KB woff2 mỗi weight, self-host (không thêm origin, không thêm DNS/TLS). `next/font` chèn `size-adjust` fallback metrics nên CLS gần như bằng 0. Chi phí thật sự đáng nhớ: `next/font/google` **fetch lúc build** → build offline/mạng hạn chế sẽ fail.

---

## 5. Theme switching — đấu nối chính xác

**`src/app/layout.tsx`**
- Bỏ `dark` khỏi className. Thêm `suppressHydrationWarning` vào `<html>` (bắt buộc: next-themes sửa `documentElement` trước khi React hydrate).
- Import `ThemeProvider` **trực tiếp từ `next-themes`** — đã verify `node_modules/next-themes/dist/index.mjs` mở đầu bằng `"use client"`, nên hợp lệ trong Server Component. *Đã loại:* file wrapper `src/components/theme-provider.tsx` quen thuộc trong tutorial — ở đây nó chỉ forward props.
- Config: `attribute="class"` (**bắt buộc khớp** `@custom-variant dark (&:is(.dark *))` đang có), `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`, giữ `enableColorScheme` mặc định `true` (được form control/scrollbar/caret native đúng theme miễn phí).
- Vị trí: `<ThemeProvider>` là **con ngoài cùng của `<body>`**. next-themes 0.4 render inline `<script>` tại chỗ, và script đồng bộ ở đầu `<body>` chạy trước khi paint → **không FOUC**.
- Thêm `export const viewport: Viewport = { themeColor: [...] }` để chrome trình duyệt mobile khớp theme.

**`src/app/admin/(protected)/layout.tsx:29`** — `<Toaster theme="dark" />` → `<Toaster />`. `sonner.tsx` đã gọi `useTheme()`; prop hardcode chính là thứ che đi provider thiếu. **Một từ.**

**`src/components/theme-toggle.tsx` + `.module.scss`** (client, mới)
- `setTheme(resolvedTheme === "dark" ? "light" : "dark")` — click tường minh đầu tiên thoát khỏi "system", đúng kỳ vọng.
- **Mẹo tránh hydration mismatch:** render **cả** `SunIcon` và `MoonIcon` vô điều kiện, ẩn một cái bằng CSS `:global(.dark) &`. Tránh được guard `mounted` kinh điển (gây nháy) và tránh mọi markup phụ thuộc theme phía server. `aria-label="Toggle theme"` tĩnh — **không** dùng `aria-pressed` vì attribute phụ thuộc state lại tái tạo đúng cái mismatch nó định mô tả.
- Dùng export hậu tố `*Icon` (`SunIcon`, `MoonIcon`) khớp convention sẵn có trong `src/components/ui/sonner.tsx`.

**Vị trí toggle:** public — bên phải `SiteNav`, hiện ở mọi width, cạnh hamburger. Admin — trong topbar, ngay trái user menu. **Và cả `/admin/login`** (người dùng light theme không nên bị ép qua màn login tối).

---

## 6. Hệ thống motion (`motion` / framer-motion)

### Nguyên tắc phân vai — CSS vs motion library

| Loại | Cơ chế | Lý do |
|---|---|---|
| hover / focus / active / press | **CSS `transition` thuần** | Rẻ nhất, không JS, không client boundary. Motion library ở đây là phí. |
| entrance khi mount | `motion` + `initial`/`animate` | |
| scroll reveal | `motion` `whileInView` + `viewport={{ once: true }}` | Support rộng hơn `animation-timeline: view()` |
| stagger danh sách | `motion` variants + `staggerChildren` | |
| exit (dialog, dropdown, mobile menu) | `AnimatePresence` | CSS **không làm được** exit animation |
| layout shift động | `layout` prop | Chỉ dùng khi thật sự cần |

**Quy tắc cứng:** hover/focus **không bao giờ** đi qua `motion`. Đây là ranh giới giữ cho bundle nhỏ và giữ RSC.

### Giữ RSC — đấu nối cụ thể

- **`src/app/layout.tsx`**: bọc `<LazyMotion features={domAnimation} strict>` + `<MotionConfig reducedMotion="user">` một lần ở root. `strict` ép mọi chỗ dùng `m.*` thay vì `motion.*` (chặn vô tình kéo full bundle vào).
- **Trong Server Component**: `import * as m from "motion/react-client"` — dùng `<m.div>` mà **không cần `"use client"`**.
- **`src/components/motion/`** (mới) — các primitive client nhận `children` đã render sẵn từ server:
  - `reveal.tsx` — `whileInView` + `once: true`, prop `delay`, `distance`
  - `stagger.tsx` — parent variants + `staggerChildren`, prop `step` (mặc định 0.06s), **cap 8 item**
  - `page-transition.tsx` — entrance cho `<main>`

  Children là server-rendered element truyền qua prop → **nội dung vẫn là RSC**, chỉ vỏ animation là client.
- Mỗi primitive lớn có `.module.scss` colocate riêng (D6).

### `prefers-reduced-motion` — hai nửa, đều tập trung

1. **`MotionConfig reducedMotion="user"`** ở root — phủ toàn bộ component `motion`. Mặc định là `"never"`, **quên set là hỏng a11y im lặng**.
2. **Một block trong `globals.css`** — phủ những thứ *không* đọc config của ta (`tw-animate-css`, shadcn primitives, sonner, và mọi `transition` CSS thuần của ta):

```css
@media (prefers-reduced-motion: reduce) {
  :root { --duration-instant:1ms; --duration-fast:1ms; --duration-base:1ms;
          --duration-slow:1ms; --duration-slower:1ms;
          --motion-distance-sm:0px; --motion-distance-md:0px; --motion-distance-lg:0px; }
  *, *::before, *::after {
    animation-duration:1ms !important; animation-delay:0ms !important;
    animation-iteration-count:1 !important; transition-duration:1ms !important;
    scroll-behavior:auto !important;
  }
}
```

Cần **cả hai**: `MotionConfig` không chạm được CSS của bên thứ ba, và blanket CSS không chạm được animation do JS drive.

### Danh mục hiệu ứng

| Tên | Nội dung | Chỗ dùng |
|---|---|---|
| `page-enter` | fade + rise 12px, `duration.base`, `ease.out`, một lần khi mount | `<main>` mỗi trang |
| `section-reveal` | `whileInView` fade + rise cho section dưới màn hình đầu | `<Reveal>` |
| `stagger-children` | cascade 60ms, cap 8 item | grid project/blog, skill pill |
| `card-lift` | `translateY(-2px)` + `elevation-2` + border→primary — **CSS thuần**, guard `hoverable` | mixin `card-link` |
| `nav-scroll-state` | sau ~64px scroll: background đậm hơn + `elevation-1` | `site-nav` (client sẵn) |
| `mobile-menu` | slide/fade qua `transform`+`opacity`, exit qua `AnimatePresence` | `site-nav` |
| `theme-toggle-icon` | sun/moon crossfade + xoay 90°, **chỉ scope trong nút** | `theme-toggle` |
| `dialog/dropdown` | enter-exit qua `AnimatePresence` + tích hợp Base UI chính thức của motion | admin AlertDialog, DropdownMenu |
| `skeleton-pulse` | pulse opacity nhẹ — **CSS thuần** | mixin `skeleton` |

### Những thứ **không** animate, và vì sao

- **Opacity của hero headline.** Element ở `opacity: 0` không được coi là đã paint — animate LCP candidate từ 0 **làm trễ chính phép đo LCP**. Hero `<h1>` **không có entrance animation**; chỉ subtext/CTA/hero image có. **Đây là quy tắc quan trọng nhất ở mục này.**
- **Chuyển theme.** `disableTransitionOnChange` dập nó đi. Transition mọi màu trên hàng nghìn element là giật và lệch pha; tức thì đẹp hơn.
- **Focus ring.** Phản hồi a11y phải tức thì.
- **Fade ảnh khi load.** Không hook được `load` mà không có JS; keyframe fade lúc parse thường chạy xong trước khi ảnh về → nháy hộp rỗng. Thay bằng: `aspect-media` với nền `--muted` → không CLS, không nháy, không cần client component.
- **Row của table khi data đổi.** `router.refresh()` sau mỗi delete sẽ re-animate mọi hàng ở mọi mutation.
- **Typewriter, parallax, scroll-jacking, count-up số liệu, route transition.** CLS, nhiễu screen reader, say chuyển động, không giá trị.

---

## 7. Public — redesign từng trang

### Vỏ chung — `src/app/(public)/layout.tsx`

- **Skip-link** (element đầu tiên, `visually-hidden` cho tới khi focus, `$z-skip`) trỏ `#main-content`; mỗi page thêm `id` đó vào `<main>` (6 sửa một dòng, trong file vốn đã bị viết lại).
- **`src/components/public/site-footer.tsx` + `.module.scss`** (mới, Server Component) — **consumer đầu tiên của `getSocialLinks()`**, hàm hiện đang export mà không ai gọi. Cộng `contactEmail` (mailto), `resumeFileUrl`, copyright. `getSiteSettings()` và `getSocialLinks()` đều `cache()` cùng một row → **0 chi phí DB thêm**, và `settings/actions.ts` đã `revalidatePath("/", "layout")` nên C3 không cần làm gì.
- **Icon social — bị chặn, cần quyết định.** Đã verify `lucide-react@^1.31` **không còn brand icon** (`Github`/`Linkedin`/`Twitter`… vắng mặt trong `.d.ts`; lucide đã deprecate chúng). Ba lựa chọn: **(a) text link** + `ArrowUpRightIcon` — zero dep, accessible, đọc ra có chủ đích → **khuyến nghị**; (b) commit tay inline SVG dưới `src/components/icons/brand/` (path simple-icons là CC0), ~5 file nhỏ; (c) `@icons-pack/react-simple-icons` — **dependency mới, cần phê duyệt riêng**.
- **`src/app/(public)/not-found.tsx`** (mới): `src/app/not-found.tsx` hiện render *ngoài* public layout, nên `/projects/xyz` sai slug đang mất cả nav lẫn footer.
- Container: `$container-wide` cho trang grid, `$container-prose` cho trang bài viết, qua mixin `container()`.

### `src/components/public/site-nav.tsx`

Hamburger dưới `md` qua `respond-below("md")`: `aria-expanded`, `aria-controls`, `Escape` đóng, đóng khi đổi route, focus trả về trigger, `MenuIcon`/`XIcon`, exit qua `AnimatePresence`. Theme toggle bên cạnh. `$z-sticky` thay magic `10`. Thêm `nav-scroll-state`. Giữ nguyên `usePathname()`/`aria-current`.

| Route | Được thêm | Ảnh hưởng query |
|---|---|---|
| **`/`** | hero với `heroImageUrl` (`priority`, **đúng một ảnh priority mỗi trang**) + avatar; hàng CTA (View projects / mailto / resume); grid featured có `coverImageUrl` + `techTags` giới hạn; testimonial có `authorAvatarUrl`, 2 cột từ md; section mới "Latest writing". **Section rỗng thì ẩn hẳn** (portfolio không nên nói "chưa có project nào"). Tách `Promise.all` thành các async section component trong `<Suspense>` để hero stream trước. | **một export cộng thêm:** `getLatestBlogPosts(take = 3)` trong `queries.ts` — vẫn bake sẵn `status: "PUBLISHED"` nên **C4 vẫn giữ** (C4 cấm *làm yếu* filter, không cấm thêm reader đã filter). Thêm case tương ứng vào `src/lib/queries.test.ts`. |
| **`/projects`** | `grid-auto` (1→2→3 cột không cần media query), cover trong hộp `aspect-media`, tech tag (tối đa 4 + "+n"), badge featured, empty state thật, `stagger-children` | không |
| **`/projects/[slug]`** | cover (`priority`), grid `galleryUrls`, `publishedAt` qua `<time>`, tech tag trên body, back-link, prose measure | không |
| **`/blog`** | `publishedAt` qua `<time>`, tag, cover thumbnail, empty state, layout dẫn theo ngày (đọc tốt hơn grid) | không |
| **`/blog/[slug]`** | cover, `<time>`, tag, tác giả (avatar + siteName), back-link, prose measure, pass `heading()` | không |
| **`/about`** | `avatarUrl`, bio thành đoạn thật, **skill group theo `category`** (thứ tự group theo `min(skill.order)` của group, để admin vẫn điều khiển được), **experience group theo `type`** WORK/EDUCATION, hiện `location`, khoảng ngày dạng tháng+năm | không |

### `src/components/markdown/`

Pass typography qua `heading()`, prose measure, `--syntax-*` thay `--chart-*`, và renderer `img` mới: ảnh markdown remote không biết kích thước nội tại nên **không dùng được `next/image`** — render `<img loading="lazy" decoding="async">` kèm `// eslint-disable-next-line @next/next/no-img-element` và comment giải thích đúng lý do đó. *Đã loại:* heading anchor id / TOC (chưa có consumer).

### Ảnh — kỷ luật CLS

`next.config.ts` đã whitelist `res.cloudinary.com` → không cần hạ tầng. Một component chung **`src/components/public/remote-image.tsx`** (Server Component) bọc `next/image`: `alt` bắt buộc, `fill` trong container `aspect-media`, `sizes` khớp grid (`"(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"`), `priority` chỉ khi được truyền, và **return null gọn gàng** khi thiếu URL.

> ⚠️ **Rủi ro cần ghi rõ:** admin form nhận URL text tuỳ ý, nhưng chỉ Cloudinary được whitelist. URL ngoài Cloudinary làm `/_next/image` trả **400 → icon ảnh vỡ** (trang **không** 500). Giảm thiểu: `RemoteImage` tập trung fallback; ghi rõ ràng buộc "dán URL Cloudinary" cho tới khi phase upload xong. Riêng `Skill.iconUrl` — **hoãn** sang phase upload thay vì ship ảnh 16px nhiều khả năng vỡ.

Thêm mới: **`src/lib/format-date.ts`** — `formatDate`/`formatDateRange`, ép `en-US` + UTC để ngày render trên server ổn định giữa build và runtime. Hàm thuần → test vitest thật, không dep.

### Loading / streaming

- `src/app/(public)/loading.tsx` — fallback cấp group.
- `projects/loading.tsx` (grid skeleton), `blog/loading.tsx` (list skeleton), `projects/[slug]/loading.tsx` + `blog/[slug]/loading.tsx` (article skeleton dùng chung shape). 5 file.
- **`<Suspense>` trong page: chỉ trang chủ.** Hero (từ `getSiteSettings()` đã `cache()`) stream ngay trong khi featured/latest/testimonials resolve. Trang list chỉ một query nên `loading.tsx` là đủ.
- **Skeleton primitive: mixin `skeleton`, không dùng shadcn skeleton.** Skeleton là layout theo hình dạng trang, và convention dành Tailwind cho shadcn.
- ⚠️ **Then chốt:** hộp skeleton phải dùng **đúng** tỉ lệ `aspect-media` và bề rộng container như nội dung thật, nếu không chính skeleton gây ra cái CLS mà ảnh đang cố tránh.

---

## 8. Admin — extraction + rebuild

### Thư mục: `src/components/admin/*` (phẳng, `.module.scss` colocate)

`CLAUDE.md` cấm **bịa alias** cho domain chưa tồn tại. Nó không cấm thêm folder dưới một alias đã có và đã có nội dung thật (`@components/ui`, `@components/public`, `@components/markdown`). `src/components/public/site-nav.tsx` là tiền lệ chính xác. **Không thêm alias mới.**

*Đã loại:* `src/app/admin/(protected)/_components/` (`/admin/login` nằm **ngoài** group protected nhưng sẽ dùng chung `Field` + theme toggle); alias `@admin/*` (đúng cái rule cấm); `src/hooks/` + `@hooks/*` (domain mỏng, alias mới cho 1–2 file).

| File (dưới `src/components/admin/`) | Loại | Trách nhiệm |
|---|---|---|
| `admin-nav-links.ts` | module thuần | `ADMIN_NAV[]` + **pure** `isNavLinkActive(pathname, href)` — test được ở node, không cần jsdom |
| `admin-sidebar.tsx` | **client** | `usePathname()`, active link, `aria-current`, brand, hàng pill mobile |
| `admin-user-menu.tsx` | **client** | `{ email }`; shadcn `dropdown-menu` + `<form action={logoutAction}>` |
| `admin-page-header.tsx` | server | `{ title, description?, breadcrumbs?, backHref?, children? }` — `children` là slot primary action |
| `admin-breadcrumbs.tsx` | server | `{ items: { label, href? }[] }`, item cuối `aria-current="page"` |
| `admin-form-shell.tsx` | presentational | `{ width?: "md" \| "lg" }` — 480 vs 640, **khác biệt thật duy nhất** giữa 6 file form scss |
| `admin-form-actions.tsx` | presentational | `{ submitLabel, isSubmitting, isDirty?, cancelHref?, destructive? }` — footer sticky, spinner, chỉ báo "Unsaved changes" |
| `admin-form-error.tsx` | presentational | `{ message }` — một vùng `role="alert"` focus được |
| `use-admin-form.ts` | **client** hook | Abstraction form *duy nhất* (§8.3) |
| `admin-table.ts` | **client** | `createTableHook(...)` → `useAdminTable`, `createAdminColumnHelper` |
| `admin-data-table.tsx` | **client** | Table generic (§8.2) |
| `admin-row-actions.tsx` | **client** | `createRowActionsColumn<TData>()` — Edit link, Delete AlertDialog, `useTransition` per-row |
| `status-badge.tsx` | presentational | `{ status }` — dựng trên `mix.pill` sẵn có |
| `admin-empty-state.tsx` | presentational | `{ icon, title, description, actionHref?, actionLabel? }` |
| `admin-stat-card.tsx` | presentational | `{ label, value, hint?, href?, tone? }` |
| `markdown-field.tsx` | **client** | Edit/Preview + toolbar; dùng bởi project `description` và blog `content` |
| `tags-input.tsx` / `url-list-input.tsx` | **client** | Chip / repeatable rows — **giá trị RHF vẫn là string** (§8.4) |
| `admin-{table,form,stat-cards}-skeleton.tsx` | presentational | Shape ghép trên `Skeleton` foundation |
| `use-unsaved-changes-guard.ts` | **client** hook | `beforeunload` + handler cho `<Link onNavigate>` |

Cộng một util ngoài folder: `src/lib/slugify.ts` + test (phải thoả `slugPattern` trong `src/lib/admin/shared-schema.ts`).

### 8.1 Cái được là **xoá file**, không phải thêm import

25 file duplicate không bị thay bằng 25 import — **phần lớn ngừng tồn tại** vì nội dung dịch chuyển *lên trên*:

- **16 `page.module.scss` cấp page** → **xoá**. Nội dung chỉ là `admin-page-container` + `section-stack` + `padding-block` + `.title`/`.header`. Container chuyển vào `(protected)/layout.tsx`; `.title`/`.header` chuyển vào `admin-page-header.module.scss`.
- **5 `<model>-table.module.scss`** → **xoá**, thay bằng `admin-data-table.module.scss` + `admin-row-actions.module.scss`.
- **6 `<model>-form.module.scss`** → **xoá**, thay bằng `admin-form-shell` / `admin-form-actions` / `admin-form-error`; block `.descriptionHeader`/`.preview` chuyển sang `markdown-field.module.scss`.

**Kết quả: 30 file SCSS admin → ~14 file dùng chung, 0 file per-model.** Đây cũng chính là D6 đúng nghĩa — mỗi *component lớn* một file SCSS riêng, thay vì mỗi *model* một bản sao.

### 8.2 `AdminDataTable` (@tanstack/react-table **v9**)

**Phát hiện:** v9 ship `createTableHook` (`node_modules/@tanstack/react-table/dist/createTableHook.d.ts`) — bản table của `createFormHook`. Khai báo feature/row-model một lần, nhận về `useAppTable` + `createAppColumnHelper<TData>()` đã bind sẵn. Đây là câu trả lời tốt nhất cho "truyền column per-model mà vẫn type-safe", và nó **nhốt toàn bộ churn API v9 vào một file**.

```ts
// src/components/admin/admin-table.ts  ("use client")
export const adminTableFeatures = tableFeatures({
  rowSortingFeature,      sortedRowModel:   createSortedRowModel(),
  globalFilteringFeature, filteredRowModel: createFilteredRowModel(),
  sortFns, filterFns,
});
export const { useAppTable: useAdminTable,
               createAppColumnHelper: createAdminColumnHelper } =
  createTableHook({ features: adminTableFeatures });
```

Đăng ký `filterFns`/`sortFns` ở đây là thứ khiến `globalFilteringFeature` thật sự resolve được filter fn — footgun v9 mà code hiện tại né được nhờ không filter.

**Chốt các câu hỏi thiết kế:**

- **Giữ pattern hiện tại**: Client Component nhận row đã fetch từ server. Page (Server Component) fetch qua `src/lib/admin/*` sau cổng auth ở layout. Sort/filter là state tương tác → thuộc client. `Date` đã đi qua ranh giới RSC và chạy tốt — **không** đổi sang ISO string.
- **Column per-model**: mỗi model giữ một `<model>-columns.tsx` nhỏ (client) làm `createAdminColumnHelper<AdminProjectRow>()`. `TFeatures` cố định bởi helper chung; `TData` suy ra tại call site. Props của table chỉ cần `TData extends { id: string }` (cho `getRowId`).
- **Edit + Delete**: component generic, cột sinh bởi factory — không nhét vào `AdminDataTable` (table không nên biết route hay action), không viết tay per model (đó chính là 40 dòng đang duplicate):

```tsx
createRowActionsColumn<AdminProjectRow>({
  entityName: "project",
  editHref: (row) => `/admin/projects/${row.id}/edit`,
  getLabel:  (row) => row.title,
  onDelete:  (row) => deleteProjectAction(row.id),
})
```

  `AdminRowActions` sở hữu template copy của AlertDialog, `useTransition`, toast lỗi, `router.refresh()`. **Việc này xoá luôn `// eslint-disable-next-line react-hooks/exhaustive-deps` + hack `[isPending]` memo đang có ở cả 5 table** — chúng tồn tại chỉ vì pending state của dialog rò vào column definition. Khi pending sống trong actions cell, column trở thành hằng số module-level, **không cần `useMemo`**.
- **Search: có**, client-side, opt-in qua `searchPlaceholder`. Mọi row đã nằm trong RSC payload nên filter client chỉ tốn một input + `createFilteredRowModel`. Debounce 150ms, `aria-controls` nối tới table id, hiện "N of M".
- **Pagination: không.** Portfolio một người thực tế có 10–30 project, ≤50 post, ~30 skill, ~10 experience, ~10 testimonial. Pagination thêm page state, thêm lớp bug "xoá row cuối của trang 3 thì đang ở đâu", và một nguồn sự thật thứ hai cho row count — cho một table vốn đã render đủ. Ngưỡng xem lại: bất kỳ table nào vượt ~200 row.

  **Ngoại lệ, và là ngoại lệ quan trọng:** `ContactMessage` tăng không giới hạn và **không do tác giả kiểm soát**. Khi nó lên, cho nó paging + filter **phía server** (`searchParams` → `skip`/`take` + `count()`), *không* dùng global filter client. Vì vậy thiết kế `AdminDataTable` **không được giả định nó sở hữu tập row**: `searchPlaceholder` optional, và toolbar nhận slot `toolbar?: React.ReactNode`.
- *Đã loại:* row selection + bulk delete (foot-gun trên CMS portfolio; AlertDialog per-row đã đủ), column visibility (tối đa 7 cột), column resizing, virtualization.
- **Nâng a11y so với markup hiện tại:** `<caption class="srOnly">`, `<th scope="col">`, `aria-sort` trên `<th>` đang sort, icon lucide `ArrowUp`/`ArrowDown`/`ChevronsUpDown` thay glyph text `" ↑"`, và wrapper overflow nhận `role="region" tabIndex={0} aria-label="… table, scrollable"` để người dùng bàn phím scroll được.

### 8.3 Form UX

**Phát hiện — toast success là code chết.** Mọi `create*/update*Action` kết bằng `redirect("/admin/<model>")`. Server action redirect thì client điều hướng và code sau `await` **không bao giờ chạy** — nên `toast.success("Project saved.")` + `router.refresh()` ở cả 5 form **chưa từng thực thi**. Chỉ Settings (không redirect) và delete (không redirect) là toast thật. Nghĩa là song song với vấn đề "báo lỗi ba lần" còn có vấn đề **"báo thành công không lần nào"**.

**Định tuyến thông báo — một hành vi cho một loại:**

| Loại | Hiện ở đâu | Toast? |
|---|---|---|
| Validation field (client zod **và** server) | `FieldError` inline dưới field, nối `aria-describedby`, focus về field lỗi đầu tiên | Không |
| Form-level / bất ngờ (`"Unauthorized."`, `"… not found."`) | Một vùng `AdminFormError` đầu form, `role="alert"`, `tabIndex={-1}`, focus khi xuất hiện | Không |
| Thành công mà ở lại trang | Trạng thái "Saved" inline trong `AdminFormActions` | Có (một) |
| Thành công mà row/trang biến mất (delete) | — | Có |

Lý do: toast cho lỗi validation là thừa, tự tắt, và bàn phím không với tới — thông báo phải nằm cạnh input gây ra nó. `FieldError` đã có sẵn `role="alert"`; thêm `id` + `aria-describedby` để screen reader còn đọc được cả lúc focus.

**Đưa lỗi server vào inline.** Mở rộng action state thành `{ error: string; field?: string }`; form làm `if (result.field) setError(result.field) else setFormError(result.error)`. `"A project with this slug already exists."` khi đó hiện ngay dưới ô slug. Đây là thay đổi **chỉ ở phần đuôi**: `toEqual({ error: "Unauthorized." })` trong các `actions.test.ts` hiện có **vẫn pass** vì key thêm là optional và không được set.

**Sửa đường thành công đang chết:**
- **Update**: bỏ `redirect(...)`, return `undefined`, ở lại trang edit, `router.refresh()` + "Saved" inline + một toast. Sửa xong không còn bị ném về list.
- **Create**: redirect sang trang edit của **record vừa tạo** (`/admin/projects/${created.id}/edit?created=1`), toast từ search param khi tới nơi.
- Xoá các dòng `toast.success`/`router.refresh()` không bao giờ chạy sau redirect.
- Giữ `revalidatePath` **y nguyên** (C3).

**Abstraction form duy nhất — `useAdminForm`** (~40 dòng): gom resolver config + `serverError` state + block định tuyến kết quả ra khỏi 6 file. **JSX của field vẫn per-model.** Đó là ranh giới: *chia sẻ phần đấu nối, giữ riêng phần field.*

> ⚠️ **`runAction` không được bọc lời gọi action trong `try/catch`.** `redirect()` hoạt động bằng cách throw một error đặc biệt; catch nó là nuốt mất điều hướng. Nếu buộc phải catch thì phải rethrow khi `isRedirectError(e)`. **Ghi comment này ngay trong file** — đây đúng kiểu "đơn giản hoá" làm hỏng create một cách im lặng.

**Không abstract:**
- Không form generator theo schema. 6 form khác nhau thật: `Controller` cho Select/Checkbox, `Field orientation="responsive"`, markdown Edit/Preview, path lồng `socialLinks.*`, `FieldSet`/`FieldLegend` ở Settings, `valueAsNumber` cho `order`, ngữ nghĩa `raw: true`. Một DSL field-config sẽ phải mã hoá hết, sẽ đánh nhau với `FieldPath<T>`, và mỗi kiểu field mới thành một thay đổi trong generator thay vì 8 dòng JSX. **Duplicate ở JSX form thì đọc được; generator thì không.**
- Không abstract server action — chúng khác nhau thật (`nextPublishedAt`, xử lý P2002, tập `revalidatePath` riêng, `upsert` cho Settings).
- Không route động `/admin/[model]` (giết typed route).
- Không `AdminButton`/`AdminInput` bọc shadcn.

### 8.4 Array input, slug, markdown, login

- **Array input — đổi UI, giữ nguyên định dạng dây.** `TagsInput` (chip; Enter/comma thêm, Backspace xoá, paste tách) cho `techTags`/`tags`; `UrlListInput` cho `galleryUrls`.

  ⚠️ **Ràng buộc then chốt:** `commaSeparatedTags` trong `src/lib/admin/shared-schema.ts` nhận **string** rồi transform thành array ở server; đó là transform duy nhất chạy trên dữ liệu được ghi (thiết kế `raw: true`). Nên **component chip serialise ngược lại đúng chuỗi comma/newline làm giá trị RHF của nó.** Zero thay đổi schema, zero thay đổi server, zero thay đổi `*-schema.test.ts`, ngữ nghĩa C2 giữ nguyên từng byte. *Đã loại* việc đổi schema sang `z.array(z.string())` — chạm 3 file schema + 3 file test + cả hai transform, đổi lại một cải thiện biểu diễn nội bộ mà người dùng không thấy.
- **Slug auto-gen** (`src/lib/slugify.ts` + test khẳng định output luôn khớp `slugPattern`): **chỉ ở create**, đồng bộ từ title khi ô slug chưa bị chạm (`getFieldState("slug").isDirty === false`), dừng vĩnh viễn khi người dùng gõ vào slug. **Edit: không bao giờ tự đổi** — có nút "Generate from title", và khi slug của item `PUBLISHED` đổi thì cảnh báo inline ("Changing the slug breaks existing links"). Action đã xử lý revalidate cả slug cũ lẫn mới — **đừng chạm**. Hiện URL public (`/projects/<slug>`) dưới field như `FieldDescription`.
- **Markdown editor** (`markdown-field.tsx`): giữ Edit/Preview (dạng toggle group 2 nút với `aria-pressed`, **không phải tablist**), thêm side-by-side từ `lg`, toolbar tối thiểu (bold, italic, link, inline code, H2, list, quote) làm bằng `textarea.setRangeText()` + `onChange` của RHF — **không dependency mới**, cộng đếm ký tự. *Đã loại:* mọi package WYSIWYG (tiptap, react-md-editor) — giá trị lưu phải là Markdown text và renderer có `rehype-sanitize` đã tồn tại.
- **`/admin/login`**: viết lại `login-form.tsx` bằng `Field`/`FieldLabel`/`Input`/`FieldError`, **giữ `useActionState`** (đây là form server-action, không phải RHF — đừng chuyển). Xoá block raw-input khỏi `login/page.module.scss`. Thêm brand mark, theme toggle, autofocus email, `aria-invalid` + `aria-describedby`. **Giữ nguyên** copy chung `"Invalid email or password."` và rate-limit — **không bao giờ** thêm phản hồi field-level kiểu "email không tồn tại" (account enumeration).

### 8.5 Shell / navigation

**Sidebar từ `lg`, topbar + hàng pill cuộn ngang ở dưới.** 7 mục giờ, 9 sắp tới (ContactMessage, Media). List dọc scale được, list ngang thì wrap xấu. Sidebar cũng cho brand / user menu / theme toggle một chỗ ở cố định.

```
src/app/admin/(protected)/layout.tsx        async Server Component — cổng auth KHÔNG đổi
└─ <div class=shell>                        grid: [sidebar][content] từ lg; xếp chồng ở dưới
   ├─ <AdminSidebar />                      "use client" — chỉ usePathname
   ├─ <header class=topbar>                 server
   │   ├─ pill nav mobile
   │   ├─ <ThemeToggle />                   "use client"
   │   └─ <AdminUserMenu email={...} />     "use client" — state dropdown
   ├─ <main class=content>{children}</main> server; sở hữu admin-page-container
   └─ <Toaster />                           BỎ theme="dark"
```

**Ranh giới RSC — chính xác cái gì thành client:**
- **Giữ server (không được đổi):** `layout.tsx` vẫn `async` với `const session = await auth(); if (!session) redirect("/admin/login");` **trước mọi render**. Đây là cổng thứ hai của C1 — `src/proxy.ts` chỉ là UX.
- **Thành client, tối thiểu:** `AdminSidebar` (cần `usePathname()`; **không** nhận session), `AdminUserMenu` (cần state dropdown; nhận `email: string` — đừng truyền cả object `session`), `ThemeToggle`.
- *Đã loại:* biến layout thành client và dựa vào middleware để auth (vi phạm C1).

**Active link** — tái dùng pattern `usePathname()` + `aria-current` từ `site-nav.tsx`, nhưng **sửa một bug pattern đó sẽ mang sang**: `pathname.startsWith(href)` làm `/admin` active ở mọi trang. Tách thành hàm thuần test được ở node:

```ts
export function isNavLinkActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}
```

**Mobile** (dưới `lg`): sidebar gập vào topbar sticky; nav thành hàng pill icon+label cuộn ngang, `scroll-snap-type: x proximity`, pill active tự scroll vào tầm nhìn. **Không drawer, không focus trap, không dependency thêm.**

**Breadcrumb**: chỉ trên `/new` và `/[id]/edit` (list page có sidebar báo vị trí rồi). **Server-render từ prop tường minh** do page truyền — page đã load entity: `breadcrumbs={[{ label: "Projects", href: "/admin/projects" }, { label: project.title }]}`. *Đã loại:* suy ra từ `usePathname()` trong client component — nó không biến `[id]` thành title được nếu không fetch lần hai, và sẽ render "clx7abc…" ra cho người dùng đọc.

**Brand**: wordmark tĩnh "Portfolio CMS" link về `/admin`. *Đã loại* đọc `siteName` qua `getSiteSettings()` — dù có `cache()` và rẻ, vẫn là một round trip DB mỗi lần điều hướng admin cho một nhãn chỉ maintainer nhìn thấy.

### 8.6 Dashboard

Ship ba vùng, hoãn một:

1. **Stat card**: Projects, Blog posts, Skills, Experience, Testimonials, Unread messages — mỗi cái `total` + `hint` kiểu "3 drafts", link tới list của nó.
2. **Needs attention**: Project/BlogPost đang DRAFT (tối đa 5, kèm `StatusBadge` + Edit link), số contact message chưa đọc, và card "Finish site setup" khi `SiteSettings.siteName`/`heroHeadline` rỗng (giá trị thật — row singleton bắt đầu rỗng trên DB chưa seed, đúng như `settings/page.tsx` đã ghi chú).
3. **Quick actions**: New project / New blog post / Edit settings.
4. **Hoãn: feed "recent activity".** CMS một tác giả thì bạn đã biết mình vừa sửa gì; nó tốn 2 trong 8 query cho tín hiệu yếu nhất. **YAGNI có chủ đích** — ghi vào roadmap thay vì build.

**Query mới — `src/lib/admin/dashboard.ts`** (file mới, **không** đặt vào `src/lib/queries.ts` — đó là biên public C4), mang cùng comment header như `src/lib/admin/projects.ts`, bọc trong React `cache()` theo tiền lệ `getSiteSettings()`.

**Hạch toán chi phí (Neon):** bản ngây thơ ≈ 10 statement. Dùng `groupBy({ by: ["status"], _count: { _all: true } })` cho Project/BlogPost/Testimonial → được **cả total lẫn draft count trong một statement** → 3 thay vì 6. `count()` cho Skill + ExperienceEntry → 2. `count({ where: { read: false } })` cho ContactMessage → 1. Một `findMany` cho danh sách draft với `select` hẹp + `take: 5` → 1. **Tổng 7 statement, gói trong một `prisma.$transaction([...])`** = một lần acquire connection, và `cache()` đảm bảo chạy đúng một lần mỗi request. Dashboard vốn đã dynamic (gọi `auth()`) nên không cache đi đâu được — 7 statement mỗi lượt xem là **giá thật**, chấp nhận được cho trang một người mở.

### 8.7 Loading / feedback trong admin

- **`loading.tsx` chỉ đặt per-route**: 5 list route → `AdminTableSkeleton`; `<model>/[id]/edit` → `AdminFormSkeleton`; `settings` → `AdminFormSkeleton`.
- ⚠️ **Không đặt `(protected)/loading.tsx`.** `loading.tsx` cấp group bọc **chính layout**, mà layout là thứ `await auth()` — fallback sẽ render **không có sidebar**, tạo ra một nháy skeleton trần rồi mới ra cả shell. Bẫy thật, ghi vào PR.
- **Không `loading.tsx` cho trang `/new`** — chúng không fetch (`skills/new/page.tsx` thậm chí không async).
- **Thêm `(protected)/error.tsx`** (giờ chỉ có root `error.tsx`) để lỗi admin vẫn giữ shell và có "Try again", thay vì ném người dùng ra trang lỗi public.
- **Dashboard Suspense**: **một** boundary quanh grid stats, nuôi bởi một lời gọi `getAdminDashboardData()`. **Đừng** tạo sáu boundary cho sáu card cùng dựa trên một query — anti-pattern kinh điển tạo ra sáu lần pop-in từ một lần await.
- **Pending per-row khi delete**: `useTransition` sống **trong** `AdminRowActions` nên `isPending` là của từng hàng. Nút confirm hiện spinner + "Deleting…", `aria-busy` trên cell. *Đã loại:* làm mờ cả `<tr>` (phải nâng state lên thành context toàn table cho một lợi ích thị giác biên).
- **`useOptimistic` — lập luận không dùng, lúc này.** Row đến từ Server Component. Optimistic delete buộc nâng danh sách row lên client state, xoá lạc quan, rồi hoà giải với dữ liệu server mới của `router.refresh()` — đúng cái phức tạp mà `useOptimistic` lẽ ra loại bỏ, kèm failure mode flash-back nổi tiếng. Thêm nữa, delete **có tính huỷ hoại và đã qua dialog xác nhận**: người dùng đã cam kết rồi, hiện một lời nói dối tức thì có thể revert thì tệ hơn một spinner 200ms. **Chỗ nó *sẽ* đáng dùng sau này:** toggle `read`/`unread` của `ContactMessage` — idempotent, không huỷ hoại, click liên tục.

### 8.8 Motion trong admin

Tất cả chỉ `transform`/`opacity`, ≤200ms.

**Nên có:** hover màu trên nav + thanh chỉ báo active trượt bằng `transform`; focus ring fade 100ms (fade *ring*, không bao giờ fade layout); một entrance `opacity` + `translateY(4px)` cho `<main>` mỗi lần điều hướng; `:active { scale: .98 }` trên button + spinner pending; enter-exit của dialog/dropdown qua `AnimatePresence` + tích hợp Base UI; skeleton shimmer; stat card hover lift + entrance stagger **một lần khi mount**.

**Có hại — ghi thành "don't" tường minh trong PR:** đừng animate row của table khi data đổi (`router.refresh()` sau mỗi delete sẽ re-animate mọi row ở mọi mutation); đừng trì hoãn xác nhận save sau một animation (trạng thái "Saved" xuất hiện tức thì; chỉ *biến mất* mới được fade); đừng animate `height: auto` khi lỗi validation xuất hiện; không `transition: all`; không hiệu ứng scroll-driven/parallax trong công cụ nhập liệu; không motion trên input khi đang gõ; không count-up số trên stat card.

---

## 9. shadcn: adopt hay tự viết SCSS

Câu hỏi quyết định: *primitive này mang **hành vi thật** (focus management, ARIA, portal positioning) hay chỉ là class Tailwind trên markup thường?* Hành vi → adopt. Trang trí → tự viết SCSS, theo mặc định của `CLAUDE.md`.

| Component | Quyết định | Lý do |
|---|---|---|
| `dropdown-menu` | **Adopt** | Hành vi thật: focus trap/roving tabindex, Escape/outside-click, semantics `role="menu"`, portal positioning. Dựng trên `@base-ui/react` vốn đã là dependency. Cùng lập luận đã biện minh cho `alert-dialog` và `select`. **Đây là component shadcn mới duy nhất được khuyến nghị.** |
| `table` | Tự viết | Thuần trang trí. Markup `<table>` + đấu nối v9 đã chạy; wrapper của shadcn sẽ đụng `admin-data-table.module.scss`. |
| `badge` | Tự viết | `mix.pill` đã tồn tại và đang dùng ở public. Thêm shadcn badge = hai hệ pill trôi khỏi nhau. |
| `breadcrumb` | Tự viết | Zero hành vi — `nav > ol > li` + separator. ~25 dòng SCSS. |
| `card` | Tự viết | `mix.card`/`mix.card-link` đã có. |
| `sidebar` | **Không adopt** | Block sidebar của shadcn là provider + cookie persistence + keyboard shortcut + hàng trăm class Tailwind, 90% không dùng. Mâu thuẫn trực tiếp với rule SCSS-mặc-định ở quy mô lớn nhất có thể. Tự viết ~80 dòng. |
| `sheet`/`dialog` cho mobile nav | Tránh hẳn | Pattern khuyến nghị là hàng pill cuộn ngang — không overlay, không focus trap, không JS. Nếu maintainer nhất định muốn drawer thì **lúc đó** adopt `sheet`, đừng tự viết overlay có focus trap. |
| `skeleton` | Dùng mixin foundation | Foundation sở hữu primitive; admin chỉ thêm shape ghép. |
| `tabs` | Bỏ | Toggle Edit/Preview **không phải** tablist (một textarea, hai chế độ render). Dùng toggle group 2 nút với `aria-pressed`. |
| `switch` / `tooltip` / `form` / `pagination` | Bỏ | `Checkbox` đã đủ; đừng giấu thông tin sau hover trong công cụ nhập liệu; `Field` + RHF đã làm việc của `form`; không có pagination. |

**Delta Tailwind ròng: một component.** Đó là cách giải quyết trung thực cho căng thẳng này — primitive shadcn đáng lấy là những cái mà tự viết sẽ làm sai phần accessibility.

---

## 10. Slicing PR

Tất cả nhánh từ `develop`. **Foundation trước, consumer sau.** Các PR page public (7–10) độc lập với nhau, chạy song song được.

| # | Branch | Phụ thuộc | Nội dung | "Done" nghĩa là |
|---|---|---|---|---|
| 0 | `docs/phase10-roadmap` | — | `docs/ROADMAP.md`: chèn Phase 10, dồn 10–14 cũ → 11–15, co Phase 13 cũ (nay 14) thành audit cuối, ghi lại phần nợ Phase 9. Entry `docs/CHANGELOG.md`. | Roadmap đọc đúng khi vào lạnh; không đổi code. Merge sớm để mọi PR sau trích số nhất quán. |
| 1 | `feature/phase10-tokens` | 0 | Mở rộng `_variables.scss` + `_mixins.scss`; CSS var motion/elevation/focus-ring/surface; block reduced-motion; **áp `focus-ring` ở mọi nơi**; refactor cơ học 6 page module sang `heading()`/`container()`; `src/styles/motion.ts`; **test token-contract**; ghi rule sở hữu token vào `CLAUDE.md` | lint/typecheck/test/build xanh; delta thị giác duy nhất là focus ring + thống nhất radius 12px→10px; **trong diff không có redesign trang nào** |
| 2 | `feature/phase10-theming` | 1 | `ThemeProvider` + `suppressHydrationWarning`, bỏ hardcode `dark`, `viewport.themeColor`, `<Toaster theme="dark">` → `<Toaster />`, `ThemeToggle` mount ở public nav **và** admin nav **và** login | Cả hai theme render đúng mọi trang public + mọi form admin; không FOUC khi hard reload ở light/dark/system; console **0** hydration warning; toast theo theme |
| 3 | `feature/phase10-palette` | 2 | Ramp oklch + remap semantic (cả hai theme), `--border` dark đục, `--syntax-*` + chuyển markdown, font heading qua `next/font`, điền map `heading()` | Bảng contrast **cả hai theme** trong PR body; **diff chứng minh không biến shadcn nào bị xoá**; kiểm mắt admin form/select/alert-dialog/sonner ở cả hai theme |
| 4 | `feature/phase10-motion` | 1, 3 | Thêm dep `motion`; `LazyMotion`+`MotionConfig` ở root; `src/components/motion/{reveal,stagger,page-transition}`; áp `card-lift` (CSS), `nav-scroll-state` | Bật reduced-motion → **không** chuyển động nào; bundle check bằng bảng route-size của `npm run build`; **không `opacity:0` trên bất kỳ LCP candidate nào** |
| 5 | `feature/phase10-public-shell` | 1–4 | `(public)/layout.tsx`: skip-link, `SiteFooter` (consumer đầu tiên của `getSocialLinks()`), mobile nav, container width, `(public)/not-found.tsx` | Đi hết bằng bàn phím với focus nhìn thấy; menu chạy ở 375px; footer xuống nhẹ nhàng khi 0 social link và không `contactEmail` |
| 6 | `feature/phase10-public-primitives` | 1, 4 | `RemoteImage`, `EmptyState`, `src/lib/format-date.ts` (+ test), mixin `skeleton`, `(public)/loading.tsx` | `format-date` có unit test; `RemoteImage` **render null** (không phải hộp vỡ) khi URL rỗng; mở khoá PR 7–10 chạy song song |
| 7 | `feature/phase10-home` | 5, 6 | Redesign home + `getLatestBlogPosts` (+ test query) + section Suspense | LCP hero không bị motion ảnh hưởng; section rỗng thì ẩn |
| 8 | `feature/phase10-projects` | 5, 6 | Grid list + trang detail + 2 `loading.tsx` | CLS < 0.1 đo được trên cả hai route; empty state verify |
| 9 | `feature/phase10-blog` | 5, 6 | List + detail + pass typography markdown + 2 `loading.tsx` | Ngày render giống nhau server/client; empty state verify |
| 10 | `feature/phase10-about` | 5, 6 | Avatar, skill theo `category`, experience theo `type`, ngày/location | Grouping tôn trọng `order` của admin; category rỗng/lạ không crash |
| 11 | `feature/phase10-admin-shell` | 1–4 | `admin-nav-links.ts` (+ `isNavLinkActive`), sidebar, topbar, user menu, shadcn `dropdown-menu`, `(protected)/layout.tsx` mới, `(protected)/error.tsx`, bỏ `Toaster theme="dark"`, chuyển container lên layout + **strip cơ học** `admin-page-container`/`padding-block` khỏi 16 file page scss | Mọi route admin render trong shell mới ở **cả hai theme**; active link đúng kể cả `/admin`; tab hết bằng bàn phím; screenshot 375/768/1024/1440; test `isNavLinkActive` pass |
| 12 | `feature/phase10-admin-login` | 1–4 | Login lên `Field`/`Input`, brand, theme toggle, focus-visible, aria | Login chạy cả hai theme; **copy lỗi không đổi**; đường rate-limit không đụng |
| 13 | `feature/phase10-admin-page-header` | 11 | `AdminPageHeader`, `AdminBreadcrumbs`, `AdminEmptyState`, `StatusBadge`; áp lên cả 16 page; **xoá toàn bộ 16 `page.module.scss` cấp page** | 16 file bị xoá; không page nào tự định nghĩa container/title; breadcrumb có ở new/edit; `git diff --stat` âm ròng; **verify từng tham chiếu `styles.*` trong file bị chạm** (rủi ro #8) |
| 14 | `feature/phase10-admin-data-table` | 13 | `admin-table.ts`, `admin-data-table`, `admin-row-actions` + factory, `admin-table-skeleton`, 5 `<model>-columns.tsx`, 5 `loading.tsx`; xoá 5 `*-table.module.scss` + thân 5 `*-table.tsx`; **gỡ cả 5 `eslint-disable exhaustive-deps`** | Sort + search chạy trên cả 5; dialog delete + pending per-row chạy; empty state có icon+CTA; `aria-sort` có mặt; **không còn eslint-disable nào**; skeleton thấy được khi throttle slow-3G |
| 15 | `feature/phase10-admin-form-shell` | 13 | `AdminFormShell`, `AdminFormActions`, `AdminFormError`, `useAdminForm`, định tuyến lỗi (+ `field?`), **sửa đường create/update redirect**, unsaved-changes guard; xoá 6 `*-form.module.scss`; tách `markdown-field` | Cả 6 form dùng shell; một lỗi một nguyên nhân; **save thành công thật sự nhìn thấy được**; `actions.test.ts` cũ xanh; **thêm test invalid-input-khi-đã-auth** (rủi ro #5) |
| 16 | `feature/phase10-admin-form-inputs` | 15 | `TagsInput`, `UrlListInput`, `slugify` + test, slug auto-gen + preview URL, toolbar markdown | Schema và `*-schema.test.ts` **không đổi** (giữ định dạng dây string); output slugify luôn khớp `slugPattern` |
| 17 | `feature/phase10-admin-dashboard` | 13 | `src/lib/admin/dashboard.ts` (+ test), stat card, needs-attention, quick action, Suspense + skeleton; **sửa mixin sai** (`page-container` → `admin-page-container`) | Dashboard dùng được không cần scroll; một `$transaction`; có `cache()`; **không thêm query nào vào `src/lib/queries.ts`** |
| 18 | `feature/phase10-a11y-audit` | tất cả | Quét focus-visible, contrast cả hai theme, verify reduced-motion, đi bằng bàn phím + screen reader, sửa responsive còn sót | Checklist trong PR body, mọi mục tick kèm bằng chứng |

**Thứ tự migrate 25 file SCSS duplicate: một PR cho một *họ component*, commit theo model.**

- **Không gộp cả 25 vào một PR** — ba họ không liên quan trong một diff là không review nổi.
- **Cũng không tách theo model thành 5 PR.** Các file **byte-identical**, nên diff đọc ra là "xoá N file giống hệt nhau, thêm 1 file dùng chung" — reviewer verify một file chung rồi spot-check hai consumer. Chia theo model nghĩa là review lại cùng một file chung năm lần, và để codebase ở trạng thái pha trộn nơi hai hệ styling cùng tồn tại, mời gọi drift, và có người sẽ sửa một file sắp bị xoá.
- **Trong mỗi PR họ, commit theo từng model** (ví dụ `skills` trước ở PR 14 — 3 cột, không status, bằng chứng nhỏ nhất — rồi bốn model kia thành các commit riêng). Reviewer đọc theo model; `git bisect` vẫn dùng được; nhánh không bao giờ land ở trạng thái nửa vời.
- Rủi ro của cách gộp theo họ là regression thị giác đồng thời trên 5 route — giảm thiểu bằng screenshot preview từng route, vốn là thứ PR 18 đằng nào cũng yêu cầu.

---

## 11. Rủi ro & regression

| # | Rủi ro | Bắt bằng cách nào |
|---|---|---|
| 1 | **shadcn mất một token** — biến thiếu làm primitive render trong suốt/đen, thường chỉ ở một theme hoặc một state (disabled, invalid) | **Test token-contract** (§12) + checklist PR 3: giá trị đổi, **tên không bao giờ đổi** |
| 2 | **`:root` append sau `.dark`** → dark âm thầm mất tác dụng do tie specificity | Test token-contract khẳng định index block `.dark` > index `:root` |
| 3 | **Contrast fail ở một theme** — dark pass, light fail (hoặc ngược lại); hardcode `dark` đã che hoàn toàn light cho tới giờ | Quét contrast trong browser, **cả hai theme, mọi route**, bảng trong PR 3 |
| 4 | **Cổng auth bị làm yếu** — layout thành client, hoặc `await auth()` tụt xuống dưới render | Layout giữ `async` + server; mục checklist PR 11; thủ công: sign out → vào `/admin/projects` → phải redirect. `src/proxy.ts` không đụng |
| 5 | **C1/C2 double validation bị "đơn giản hoá" mất.** `actions.test.ts` hiện có bắt được việc gỡ **auth check** nhưng **không** bắt được việc gỡ `safeParse` phía server | **Bịt lỗ hổng ở PR 15:** thêm test per-model mock `auth` → có session và truyền input sai, khẳng định `{ error }` **và** `prisma.<model>.create` **không được gọi**. Đây là lỗ hổng coverage thật đang tồn tại |
| 6 | **Rò draft C4** — query dashboard bị thêm vào `src/lib/queries.ts`, hoặc hàm stats admin bị public page import | Query dashboard chỉ ở `src/lib/admin/dashboard.ts` với cùng comment cảnh báo như `projects.ts`; mở rộng `src/lib/queries.test.ts`; grep khi review PR 17 |
| 7 | **Bộ `actions.test.ts` vỡ** do đổi action state | Giữ type là `{ error: string; field?: string }` để `toEqual({ error: "Unauthorized." })` vẫn khớp. **Không** chuyển sang throw hay discriminated union |
| 8 | **Xoá `.module.scss` mà page vẫn tham chiếu.** Next không type CSS module, nên `styles.foo` trên class đã xoá là `undefined` → element mất style **im lặng**, và **typecheck không bắt được** | Trước khi xoá, chạy lại nhóm md5 để xác nhận identical; sau khi xoá, grep mọi chỗ dùng `styles.` trong file bị chạm; kiểm mắt từng route trên preview. **Ghi tên rủi ro này vào PR 13/14/15 — đây là regression khả năng cao nhất của cả phase** |
| 9 | **`redirect()` bị nuốt bởi `try/catch`** trong `useAdminForm.runAction` | Không try/catch trong `runAction` (có comment trong file); nếu buộc phải thêm thì rethrow khi `isRedirectError`. Thủ công: tạo project → phải hạ cánh ở trang edit của record mới |
| 10 | **Hydration mismatch từ theme** | `suppressHydrationWarning` trên `<html>`; toggle render **cả hai icon** và đổi bằng CSS (không state `mounted`, không markup phụ thuộc theme); check console |
| 11 | **FOUC** — provider mount quá sâu, hoặc inline script bị defer | Provider là con ngoài cùng của `<body>`; hard reload với từng theme đã lưu, throttle 3G |
| 12 | **CLS từ ảnh** — ảnh đầu tiên của site, regression xác suất cao nhất phía public | `aspect-media` mọi ảnh; `sizes` khớp grid; **đúng một `priority` mỗi trang**; đo bằng PerformanceObserver từng route |
| 13 | **Motion làm hỏng perceived perf** — `opacity:0` trên LCP candidate làm trễ chính phép đo LCP | Rule cứng (hero `<h1>` không entrance) + đo LCP ở PR 4 và 7 |
| 14 | **Rò reduced-motion từ bên thứ ba** — `tw-animate-css`/shadcn/sonner không đọc `MotionConfig` của ta | Cần **cả hai** cơ chế §6: `MotionConfig reducedMotion="user"` + blanket CSS `!important` |
| 15 | **Bundle phình từ `motion`** | `LazyMotion features={domAnimation} strict` bắt buộc; import `m` không phải `motion`; so bảng route-size của `npm run build` trước/sau ở PR 4 |
| 16 | **SCSS Module vs Tailwind specificity.** Utility Tailwind v4 và class CSS-module đều specificity một-class → **thứ tự stylesheet quyết định**, âm thầm và không ổn định | Rule: không bao giờ restyle nội thất của một shadcn primitive từ SCSS; chỉ truyền class layout-only (`align-self`, `width`, `grid-area`) qua `className` — cách `styles.submit`/`styles.error` hiện tại đang dùng là **đúng** chính vì nó chỉ làm vậy; nếu có xung đột thật thì đổi CSS variable, **không bao giờ với tới `!important`** |
| 17 | **Dùng sai API v9** — tên v8 (`useReactTable`, `getCoreRowModel`, `flexRender` trần), bật `globalFilteringFeature` mà không có `filteredRowModel`/`filterFns` | `npm run typecheck` (type v9 tham số hoá theo feature, rất chặt); **mọi import v9 nhốt trong `admin-table.ts`** nên minor sau này chỉ có một điểm nổ |
| 18 | **`loading.tsx` cấp group nháy skeleton không có shell** (nó bọc chính `await auth()` của layout) | Không thêm `(protected)/loading.tsx`; chỉ per-route. Verify bằng throttle mạng |
| 19 | **Thống nhất radius** — `$radius-lg` 12px → `--radius-lg` 10px đổi mọi góc card | Nêu rõ ở PR 1 là **có chủ đích**; visual diff 4 trang |
| 20 | **`next/font` fetch lúc build** → build offline fail | Ghi chú ở PR 3; build Vercel không sao |
| 21 | **URL ảnh ngoài Cloudinary** → `/_next/image` 400 | Fallback tập trung ở `RemoteImage` + ghi ràng buộc cho admin; hoãn `Skill.iconUrl` |
| 22 | **`revalidatePath("/", "layout")`** của settings giờ cũng revalidate layout admin | Vô hại (admin vốn dynamic) — **ghi lại để không ai "sửa" nó bằng cách thu hẹp path và làm hỏng revalidate public (C3)** |

---

## 12. Chiến lược verify

### `npm run lint` bắt được

`eslint-config-next/core-web-vitals` đã bao gồm `@next/next/no-img-element` và tập con jsx-a11y (`alt-text`, `aria-props`, `role-has-required-aria-props`) → **thiếu `alt` và `<img>` thô bị lint chặn**. Đó là coverage thật cho hai tiêu chí a11y. Cộng: import thừa còn lại sau khi xoá SCSS/JSX; `react-hooks/exhaustive-deps` — **gỡ 5 dòng `eslint-disable` là mục DoD, không phải tác dụng phụ**.

### `npm run typecheck` (`next typegen && tsc --noEmit`) bắt được

Dùng sai generic/feature v9; suy luận `TData` của `AdminDataTable`; `FieldPath` trong `setError`; đổi chữ ký action lan ra mọi call site; `PageProps<"/admin/contact-messages/[id]">` sau `next typegen`.

### `npm run build` bắt được

Vi phạm ranh giới RSC (`useTheme`/`motion` client lọt vào Server Component), đặt sai `"use client"`, lỗi biên dịch SCSS + resolve `@styles`, và **bảng route-size** cho rủi ro #15.

### `npm run test` — test node-only mới (không cần jsdom)

- **`src/styles/tokens.test.ts`** (mới, giá trị cao, ~40 dòng, `node:fs` + regex): parse `src/app/globals.css` và khẳng định (1) danh sách cố định các biến shadcn bắt buộc tồn tại trong **cả** `:root` và `.dark`; (2) hai block định nghĩa **cùng tập key** (trừ `--radius`); (3) `.dark` xuất hiện **sau** `:root`; (4) không có `#hex`/`rgb(`/`hsl(` ở đâu cả — kỷ luật oklch-only. Đây là lá chắn rẻ nhất có thể cho hai failure mode dễ lọt qua review nhất.
- **`src/styles/motion.test.ts`**: khẳng định mọi key trong `src/styles/motion.ts` có CSS var `--duration-*`/`--ease-*` tương ứng trong `globals.css` — chống drift giữa bản JS và bản CSS.
- `src/lib/format-date.test.ts`; `src/lib/slugify.test.ts` (output luôn khớp `slugPattern`); `src/lib/admin/dashboard.test.ts` (mock Prisma, khẳng định batch `$transaction` và shape `select`/`where`); `admin-nav-links.test.ts` (`isNavLinkActive` — **đây là lý do tách matcher thành hàm thuần**: coverage thật cho logic khó duy nhất của shell, zero hạ tầng test); mở rộng `actions.test.ts` ×5 (case authenticated + invalid input, rủi ro #5); thêm case `getLatestBlogPosts` vào `src/lib/queries.test.ts`.

### jsdom + RTL: **ngoài scope phase này — là một quyết định riêng**

Thêm `jsdom`, `@testing-library/react`, `user-event`, `jest-dom`, tách environment trong `vitest.config.mts`, và mở `include` từ `src/**/*.test.ts` sang `.tsx` là một thay đổi hạ tầng test có failure mode riêng và giá trị học riêng — nhét vào một overhaul 19 PR là nhân đôi diff và chôn nó đi. Tệ hơn: những component test giá trị cao nhất (sort/filter của table, định tuyến lỗi của form, hành vi dialog) nhắm vào chính những API sẽ churn **trong lúc** phase này diễn ra — viết trước nghĩa là viết lại hai lần.

**Khuyến nghị:** land Phase 10 với test node-only cộng việc **cố ý tách logic thuần ra** (`isNavLinkActive`, `slugify`, `format-date`, helper định tuyến lỗi) để hành vi có ý nghĩa test được mà không cần DOM. Rồi mở `chore/vitest-jsdom-rtl` ngay sau đó, với `AdminDataTable` và `useAdminForm` là mục tiêu đầu tiên.

*Phương án thay thế trung thực:* nếu maintainer muốn component test **trong** Phase 10 thì nó phải vào làm **PR 0** — trước khi có component nào — để component được viết theo test-first. Thứ **không được** xảy ra là bắt vít RTL vào cuối ở PR 18.

### Phải kiểm bằng mắt (preview deployment + Claude-in-Chrome MCP)

1. Cả hai theme trên mọi route public + ~17 route admin; đo contrast trên `StatusBadge`, muted text, button disabled **ở light theme** (theme vừa mới thành thật).
2. Responsive 375 / 768 / 1024 / 1440.
3. Tab hết mọi route: focus ring nhìn thấy trên **mọi** element tương tác (baseline hôm nay: **một** file).
4. Sort + search; dialog delete + pending per-row; vị trí/contrast của toast.
5. Skeleton → content khi throttle: không layout shift.
6. Markdown editor: toolbar, preview, side-by-side từ lg.
7. Unsaved-changes: reload, và cancel qua `onNavigate` trong app.
8. Emulate `prefers-reduced-motion: reduce` — **mọi** chuyển động bị dập.
9. Screen reader smoke (Narrator/NVDA): landmark nav + `aria-current`, thông báo lỗi form, caption table + `aria-sort`.
10. **Phần verify còn nợ của Phase 9**: publish/unpublish một project và một post, xác nhận `revalidatePath` phản ánh đúng trên URL preview public.

### Giới hạn trung thực

- Palette và typography **có thật sự trông có chủ đích hay không** — không test nào đo được gu thẩm mỹ.
- Screen reader thật, thiết bị cảm ứng thật, iOS Safari thật — **đó chính xác là việc của audit cuối (Phase 14 sau khi dồn số)**, và nên nằm nguyên ở đó thay vì giả vờ làm ở đây.
- **Không thêm Playwright ở phase này.** E2E trên một redesign đang bay tạo ra churn snapshot chứ không tạo tín hiệu. Xem lại sau khi phần thị giác đã ổn định.

---

## 13. Ngoài scope (ghi rõ để không ai làm trùng)

- `generateMetadata` / OG image / `sitemap.ts` / `robots.ts` → **Phase 13 (SEO)** sau khi dồn số. Kề sát nhưng không thuộc phase này.
- Upload Cloudinary → **Phase 11**. Phase 10 chỉ *render* ảnh từ URL đã có trong DB.
- Contact form public → **Phase 12**.
- Filter tech-tag trên `/projects`, lightbox gallery, pagination public — loại có chủ đích (§7, §8.2).
- Feed "recent activity" ở dashboard — YAGNI có chủ đích (§8.6).
- Chuyển `commaSeparatedTags` sang `z.array(z.string())` — loại có chủ đích (§8.4).
- jsdom + RTL — quyết định riêng, `chore/vitest-jsdom-rtl` ngay sau phase này (§12).
- Icon brand cho social link — **cần maintainer quyết** giữa 3 phương án ở §7.

---

## 14. Bảng roadmap sau khi dồn số

| Cũ | Mới | Phase |
|---|---|---|
| — | **10** | **UI/UX overhaul (phase này)** |
| 10 | 11 | Image upload (Cloudinary) |
| 11 | 12 | Contact form + email |
| 12 | 13 | SEO |
| 13 | 14 | A11y + responsive polish → **co lại thành audit cuối** (cross-device, screen reader, touch thật) |
| 14 | 15 | Release |

Dồn số an toàn vì Phase 10–14 cũ **chưa có dòng code hay entry CHANGELOG nào** — chỉ cần sửa bảng roadmap và các heading.
