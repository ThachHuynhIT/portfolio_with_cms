# Phase 16 — Public UI & CV ("tài liệu xếp chữ")

- **Ngày chốt thiết kế**: 2026-08-26
- **Trạng thái**: 📋 Đã chốt thiết kế — **chưa bắt đầu implement**
- **Điều kiện khởi động**: không có. Phase 15 đã merge (`aae78ee`).
- **Branch convention**: `feature/phase16-<name>`, mỗi PR một slice, đều nhánh từ `develop`

---

## 0. Vị trí trong roadmap

Phase này **chen vào đầu** chuỗi 4 phase enhance đã chốt ngày 2026-08-25, nên mọi phase sau dời số.
Lý do chen vào: maintainer muốn dùng site như một phần CV của mình và cần chỗ cho người khác đọc
CV — đó là mục đích sử dụng thật của site, đứng trước mọi việc nội bộ.

| # | Phase | Scope một dòng |
|---|---|---|
| **16** | **Public UI & CV** ← spec này | Route `/cv` + home nhiều section giới thiệu |
| 17 | Admin UI | Layout + mật độ (sidebar thu gọn, bỏ cap 960px, page header sticky) |
| 18 | Hardening & test net | (cũ 16) E2E net + observability + rate-limit thật + Cloudinary orphan |
| 19 | `src/modules/<domain>/` | (cũ 17) Gom action + lib + schema + form theo domain |
| 20 | Content features | (cũ 18) Pagination/tag/search, RSS, OG image động, draft preview |
| 21 | Admin/CMS mở rộng | (cũ 19) `AdminUser.role`, audit log, media library, bulk action |

An toàn khi đánh số lại vì 18–21 chưa có dòng code hay entry CHANGELOG nào; spec của 18
(`2026-08-25-phase18-hardening-test-net-design.md`) đã được rename và sửa số trong cùng PR với
spec này.

**Cái giá đã biết của việc để UI trước hardening:** hai phase UI sẽ sửa nhiều file public/admin mà
chưa có lưới E2E nào (Phase 18 mới dựng). Chấp nhận được vì UI regression là loại thấy ngay bằng
mắt — khác với một auth check bị move sai chỗ, là loại chỉ test bắt được.

---

## 1. Context — vì sao có phase này

Site chạy đúng chức năng sau Phase 15 nhưng **đọc như output mặc định của template**. Ba nguyên
nhân dưới đây đều verify bằng code, và điều đáng chú ý là cả ba đều là **vật liệu đã có sẵn nhưng
chưa được tiêu** — không phải thứ còn thiếu:

**A. Site không có đỉnh typographic nào.**
`$font-size-display: clamp(2.25rem, 6vw, 4.5rem)` tồn tại trong `src/styles/_variables.scss`, nhưng
`grep -rn "font-size-display" src --include=*.scss` (trừ chính file định nghĩa) trả về **không kết
quả nào**. Hero `<h1>` ở `src/app/(public)/page.module.scss` dùng `heading("h1")` = `$font-size-2xl`
(30px), lên `$font-size-3xl` (36px) ở `md`. Tên/tiêu đề lớn nhất trên site chỉ 36px → mọi thứ trông
cùng một cỡ.

**B. Có sẵn một màu thứ hai chưa ai dùng.**
Ramp `--accent-*` (hue 64, hổ phách) trong `src/app/globals.css` đã được gamut-check đầy đủ 11 rung,
nhưng consumer duy nhất là `--syntax-string` (highlight code block). Không một var semantic nào trỏ
vào nó. Comment ngay trong file còn ghi *"Not yet consumed by a semantic var — first likely consumer
is a featured badge (Phase 10 PR 8)"* — việc đó chưa từng xảy ra.

**C. Font display đã có và tốt.**
`Bricolage_Grotesque` (weight 600/700) đã load ở `src/app/layout.tsx` thành `--font-display`, và
`$font-family-heading` đã trỏ tới nó. Không cần thêm font — cần **dùng** nó ở cỡ lớn.

### Về CV: dữ liệu gần đủ, thiếu đúng một thứ

| Cần cho CV | Trạng thái |
|---|---|
| Kinh nghiệm làm việc + học vấn | ✅ `ExperienceEntry.type` đã là enum `WORK \| EDUCATION` |
| Khoảng thời gian, tổ chức, địa điểm | ✅ `startDate`/`endDate`/`organization`/`location` |
| Skills nhóm theo lĩnh vực | ✅ `Skill.category` + `order` |
| File CV tải về | ✅ `SiteSettings.resumeFileUrl`, đã nối vào nút "Resume" ở hero |
| Bullet trong mô tả kinh nghiệm | ⚠️ `description` là **một `String`** duy nhất |

Chỉ có một khoảng trống, và nó **giải được không cần migration**: render `description` qua component
`Markdown` đã có (`src/components/markdown/markdown.tsx` — `remarkGfm` + `rehypeSanitize` đã bật),
nên `- item` thành `<ul>`. Phía admin đổi `Textarea` sang `MarkdownField` đã có (toolbar của nó đã
có sẵn nút List). Đây là lý do **loại** phương án thêm field `highlights String[]`.

### Kết quả mong muốn

Một trang `/cv` đọc được như CV thật, in ra được, gửi link cho recruiter được; home giàu section
giới thiệu nhưng vẫn gọn và dẫn vào `/cv`.

---

## 2. Quyết định đã chốt với maintainer

| # | Vấn đề | Chốt | Đã cân nhắc và loại |
|---|---|---|---|
| D1 | CV sống ở đâu | **Route `/cv` riêng** + `@media print` + nút tải `resumeFileUrl`; home có section giới thiệu dẫn vào đó | Nâng `/about` thành CV (about và CV là hai giọng viết khác nhau); dồn hết vào home one-page (khó gửi recruiter một link "đây là CV của tôi"); PDF sinh từ DB (nặng: thêm dependency render + layout bản in riêng) |
| D2 | Section thêm vào home | **Giới thiệu ngắn + skills**, và **CTA liên hệ cuối trang** | Timeline kinh nghiệm trên home (trùng `/cv`); hàng số liệu dưới hero (không có dữ liệu thật để tính, sẽ thành số bịa) |
| D3 | Hướng thẩm mỹ | **"Tài liệu xếp chữ"** — xem §3 | Editorial spread (cần ảnh chụp đẹp thật, ảnh yếu là chìm); kiểu terminal/mono (look dễ gặp ở portfolio dev, mono hại khả năng đọc ở độ dài một CV) |
| D4 | Bullet cho CV | **Render `description` qua `Markdown` đã có** | Thêm `highlights String[]` (migration + sửa form + sửa Zod schema, cho cùng một kết quả) |
| D5 | Chia phase | **Public trước (16), admin sau (17)** | Gộp cả hai vào một phase (Phase 10 từng kiểu này và mất 19 PR) |
| D6 | Scope admin ở Phase 17 | **Chỉ layout + mật độ** | Command palette; table UX (search/sort/pagination) — cả hai để dành, không phải bỏ |

---

## 3. Hướng thẩm mỹ — "tài liệu xếp chữ"

**Giữ nguyên, không đập đi làm lại:** palette violet (hue 264), Bricolage Grotesque + Geist, và
toàn bộ hệ token Phase 10. Phase này **không** phải một cuộc thiết kế lại — nó tiêu ba thứ đã có
(§1.A/B/C) và thêm một trang.

**Ý tưởng trung tâm:** `/cv` **cố tình khác** phần còn lại của site — không card, không shadow, một
cột đo đứng ~68ch, rãnh ngày tháng bằng Geist Mono bên trái, kẻ hairline. Đây là rủi ro thẩm mỹ có
chủ đích, và nó biện minh được bằng chức năng: một CV *là* một tài liệu, nên khi thiết kế đã có
hình tài liệu thì **bản in gần như miễn phí** thay vì phải bịa ra một stylesheet in riêng chống lại
layout web.

**Amber làm đúng một việc trên toàn site:** đánh dấu vai trò hiện tại (`endDate === null`) trong
rãnh ngày tháng. Một accent chỉ có một nhiệm vụ thì nó mang thông tin; rải khắp nơi thì thành trang trí.

**Hai thứ bị loại bỏ có chủ đích:**
- **Không numbering `01 / 02 / 03`** cho section home. Các section đó không phải một chuỗi có thứ
  tự (giới thiệu, việc đã làm, bài viết, liên hệ — đọc thứ tự nào cũng được), nên số sẽ là trang trí
  chứ không mã hoá thông tin gì. Chỉ dùng nhãn eyebrow bằng mono.
- **Testimonials không lên `/cv`.** Chúng thuộc home. Một CV không tự đính kèm lời khen.

---

## 4. Tầng token

**`src/styles/_mixins.scss`**
- Thêm level `"display"` vào map `$heading-levels`: `size: $font-size-display`, `weight: 700`,
  `leading: 0.95`, `tracking: $tracking-tighter`, `family: $font-family-heading`.
  **Không đổi `"h1"`** — nó đang dùng ở nhiều trang, đổi sẽ lan ra ngoài scope phase này.
- Mixin `eyebrow`: `$font-family-mono`, `$font-size-xs`, `$tracking-wide`, uppercase,
  `color: var(--muted-foreground)`. Nhãn section dùng chung cho cả home và `/cv`.
- Mixin `measure($ch: 68ch)`: cột đo đứng cho `/cv` — `max-width` theo `ch`, **không** theo `rem`,
  vì đơn vị đo của một tài liệu là ký tự chứ không phải pixel.

**`src/app/globals.css`** — token semantic cho marker amber, append vào **cả** `:root` **và**
`.dark`, `.dark` giữ nguyên vị trí sau `:root` (hai cái bẫy đã ghi trong `CLAUDE.md`):
- `:root`: `--marker-current: var(--accent-600);` (L .55 — đủ ngưỡng 3:1 cho non-text UI trên nền sáng)
- `.dark`: `--marker-current: var(--accent-400);`

Theo đúng cách `--syntax-string` đã làm (accent-700 sáng / accent-400 tối) — không phát minh pattern mới.

**`src/styles/_variables.scss`** — alias mỏng `$marker-current: var(--marker-current);` trong tầng
alias. SCSS Module không bao giờ gõ `var()` thô.

**`src/styles/tokens.test.ts`** — thêm `--marker-current` vào assertion parity `:root`/`.dark`. Test
này đang guard contract token nên phải đi cùng, không để sau.

---

## 5. Route `/cv`

**File mới:** `src/app/(public)/cv/page.tsx`, `page.module.scss`, `loading.tsx`,
`loading.module.scss`. Mọi route public khác đều có `loading.tsx` — theo pattern, không tạo ngoại lệ.

**Không thêm query nào mới.** Tất cả đã có trong `src/lib/queries.ts`: `getSiteSettings()`,
`getSocialLinks()`, `getSkills()`, `getExperienceEntries()`, `getFeaturedProjects()`. Chia
WORK/EDUCATION bằng `groupBy` (`src/lib/group-by.ts`). Metadata qua `buildMetadata()`
(`src/lib/seo.ts`).

| Section | Nội dung | Nguồn |
|---|---|---|
| Header | Tên (`heading("display")`), vai trò, hàng liên hệ (email + social), nút tải PDF, nút In | `SiteSettings`, `getSocialLinks()` |
| Experience | Rãnh mono trái (khoảng năm + thời lượng) ‖ vai trò/tổ chức/địa điểm + bullet | `ExperienceEntry` type `WORK` |
| Education | Cùng cấu trúc, dày hơn | `ExperienceEntry` type `EDUCATION` |
| Skills | Nhãn category bằng mono trái ‖ danh sách phân cách bằng dấu phẩy — **không pill**: pill là ngôn ngữ của phần còn lại site, tài liệu thì dùng chữ | `getSkills()` + `groupBy` |
| Selected work | Hàng gọn: tiêu đề, summary, tech tag dạng chữ, link live/repo. **Không ảnh cover** | `getFeaturedProjects()` |

**Helper mới** — thuần, có test, colocate vào `src/lib/format-date.ts` + `format-date.test.ts`:
- `formatYearRange(start, end)` → dạng gọn cho rãnh mono ("2024 — now"). `formatDateRange()` hiện
  tại trả "March 2021 — Present", quá dài cho một rãnh hẹp → **giữ nguyên hàm cũ**, thêm hàm mới.
- `formatDuration(start, end)` → "1y 8m".

**Layout:** grid 2 cột từ `md` (`grid-template-columns: 10rem 1fr`), 1 cột ở mobile với ngày nằm
trên. Dùng mixin `respond-to("md")`, không `@media` thô.

### Print — là thiết kế, không phải phần thêm sau

- Trong `cv/page.module.scss`: `break-inside: avoid` cho từng entry; ẩn nút In/nút tải; đặt
  `color`/`background` tường minh **trên chính element của trang** để bản in không tốn mực khi
  đang ở dark theme. **Không** chạm `:root` từ trong module — đó sẽ là global leakage.
- Ẩn chrome: mỗi component **tự ẩn mình** bằng block `@media print { display: none }` trong
  `site-nav.module.scss`, `site-footer.module.scss`, và `.skipLink` của
  `src/app/(public)/layout.module.scss`. Đúng rule ownership trong `CLAUDE.md` — không dồn vào
  `globals.css`.

**Nút In** là client component nhỏ gọi `window.print()`, ẩn khi in. Lý do có nó dù đã có Ctrl+P:
recruiter sẽ không tự đoán ra.

### Đấu nối route
- `src/components/public/site-nav.tsx`: thêm `{ href: "/cv", label: "CV" }` ngay sau About.
- `src/app/sitemap.ts`: thêm `/cv`; cập nhật `src/app/sitemap.test.ts`.

---

## 6. Home

`src/app/(public)/page.tsx` + `page.module.scss`.

- Hero `<h1>` → `heading("display")`, thêm eyebrow mono (vai trò/tagline) phía trên tên.
  **Giữ nguyên ràng buộc LCP đã ghi bằng comment trong file:** `<h1>` không bao giờ được bọc trong
  motion component — animate từ `opacity: 0` sẽ làm chậm thời điểm browser coi là đã paint.
- CTA chính đổi thành "View CV" (`/cv`); giữ Email + Resume.
- **Section mới "Intro + skills"**: 1–2 đoạn đầu của `settings.bio` + skills nhóm theo category.
- **Section mới "Contact CTA"** cuối trang: email, social, tải CV, link `/contact`. Hiện cuối trang
  không có đường ra nào cả.
- Mọi `sectionTitle` nhận eyebrow mono (không số — xem §3).
- Thứ tự: hero → intro+skills → featured work → latest writing → testimonials → contact CTA. Social
  proof đặt sát lời mời liên hệ.

**Gỡ một chỗ trùng:** logic tách đoạn `bio.split(/\n\s*\n/)` đang inline trong
`src/app/(public)/about/page.tsx` và sẽ cần lại ở home → tách thành `src/lib/paragraphs.ts`
(`splitParagraphs`) + test, dùng ở cả hai chỗ.

---

## 7. Chống trùng `/about` ↔ `/cv`, và form admin

**Quyết định:** `/cv` là nơi **duy nhất** có timeline Experience/Education. `/about` thu về bio dạng
dài + skills + link sang `/cv`.

Không làm bước này thì hai trang hiển thị cùng một timeline — người xem sẽ đọc đó là sự cẩu thả.
Dễ revert nếu sau này maintainer muốn giữ cả hai. File: `src/app/(public)/about/page.tsx` +
`page.module.scss`.

**Admin — thay đổi duy nhất trong phase này:** trong
`src/app/admin/(protected)/experience/experience-form.tsx` (~dòng 153), đổi `Textarea` thô sang
`MarkdownField` cho field `description`. `MarkdownField` đã có nút List trong toolbar và đã dùng cho
blog content → nhất quán. **Không** migration, **không** đổi Prisma schema, **không** đổi Zod schema
(vẫn là `String`).

---

## 8. Exit criteria

1. `/cv` render đủ 5 section từ DB thật; entry có `- bullet` trong `description` ra đúng `<ul>`.
2. **Print preview (Ctrl+P) đúng ở cả light và dark theme** — nav/footer/nút biến mất, không entry
   nào bị cắt giữa trang, không in nền tối. Đây là tiêu chí quan trọng nhất: nếu bản in sai thì
   hướng thiết kế "tài liệu" không đứng được, và cả §3 phải xem lại.
3. Contrast marker amber ≥ 3:1 (non-text UI) trên **cả hai** theme — đo thật bằng
   `getComputedStyle` + canvas như Phase 14 đã làm, không suy luận từ giá trị oklch.
4. `/cv` có trong `sitemap.xml`; nav có link CV; `generateMetadata` trả title/description/canonical.
5. Home có hero cỡ display + 2 section mới; `<h1>` vẫn không bị bọc motion (kiểm bằng đọc code +
   Lighthouse LCP không tệ hơn trước).
6. `/about` không còn timeline; không còn nội dung nào hiện ở cả hai trang.
7. Sửa `description` trong admin → `/cv` cập nhật (chuỗi `revalidatePath` còn sống).
8. `npm run lint` / `typecheck` / `test` / `build` xanh. Test mới: `formatYearRange`,
   `formatDuration`, `splitParagraphs`, parity `--marker-current`, `/cv` trong sitemap.
9. `docs/CHANGELOG.md` + `docs/ROADMAP.md` cập nhật.

**Giới hạn đã biết, không nói tránh:** kiểm bằng bàn phím thật và 3 viewport thật (375/768/1280) là
**việc thủ công của maintainer** trong phase này. Browser automation ở môi trường này không set
`document.activeElement` như thao tác thật và `resize_window` khoá viewport — đã xác nhận ở Phase 14.
Lưới tự động cho hai việc đó chỉ có sau Phase 18 (Playwright). Không claim đã verify khi chưa.

---

## 9. Ngoài scope

- **Admin UI → Phase 17** (scope đã chốt ở D6: layout + mật độ).
- Certifications, mức thành thạo cho `Skill`, `highlights String[]` cho `ExperienceEntry` — đều là
  migration, và không cần cho hướng thiết kế này (bullet đã giải bằng Markdown, D4).
- PDF sinh tự động từ DB (D1) — dùng `resumeFileUrl` upload tay + bản in của browser.
- Đổi palette / font / bỏ card ở phần còn lại của site — hệ token Phase 10 giữ nguyên (§3).
- OG image động cho `/cv` → Phase 20.
- i18n / bản CV tiếng Việt — chưa bàn tới.

### Rủi ro

| Rủi ro | Giảm nhẹ |
|---|---|
| Bản in sai → cả hướng thiết kế sụp | Exit criterion #2 là gate; print được thiết kế từ đầu, không thêm sau |
| `/cv` trông lạc khỏi phần còn lại site | Đó là chủ đích (§3), nhưng giữ chung palette/font/nav/footer để vẫn cùng một site |
| Hero cỡ display làm LCP tệ hơn | `<h1>` vẫn là HTML tĩnh không animate; font đã preload qua `next/font` |
| Bỏ timeline khỏi `/about` là quyết định của tôi, không phải yêu cầu | Ghi rõ ở §7 là dễ revert |
| Hai phase UI đi trước khi có E2E | §0 — chấp nhận có ý thức, UI regression thấy bằng mắt |
