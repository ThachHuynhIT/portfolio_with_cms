# Phase 16 — Hardening & test net

- **Ngày chốt thiết kế**: 2026-08-25
- **Trạng thái**: 📋 Đã chốt thiết kế — **chưa bắt đầu implement**
- **Điều kiện khởi động**: không có. Phase 15 đã merge (`aae78ee`); mục Vercel production branch còn treo ở Phase 15 không chặn phase này.
- **Branch convention**: `feature/phase16-<name>`, mỗi PR một slice, đều nhánh từ `develop`

---

## 0. Vị trí trong roadmap — phase này thuộc một chuỗi 4

Maintainer chọn cả 4 hướng enhance, nên chúng được decompose thành 4 phase riêng, mỗi phase
một spec → plan → implement riêng. Ghi ở đây để phase sau không phải suy luận lại thứ tự:

| # | Phase | Scope một dòng |
|---|---|---|
| **16** | **Hardening & test net** ← spec này | E2E net + observability + rate-limit thật + Cloudinary orphan |
| 17 | `src/modules/<domain>/` | Gom `app/**/actions.ts` + `lib/admin/*` + schema + form theo domain |
| 18 | Content features | Pagination/tag/search, RSS, OG image động, draft preview |
| 19 | Admin/CMS mở rộng | `AdminUser.role`, audit log, media library, bulk action |

**Chỉ có một điểm neo cứng: 16 trước 17.** Phase 17 là refactor thuần, di chuyển code của cả 6
domain — không có lưới E2E thì regression duy nhất bắt được là typecheck, và typecheck không
biết một `revalidatePath` bị mất hay một auth check bị move sai chỗ. Làm 16 trước cũng khiến
18/19 viết thẳng vào cấu trúc mới thay vì phải move lại lần hai. 18 ↔ 19 đổi chỗ tự do.

---

## 1. Context — vì sao có phase này

Site đã feature-complete sau Phase 15. Bốn khoảng trống dưới đây đều **verify bằng code**, không
phải đọc doc:

**A. 188 unit test, 0 E2E.** `npm run test` (2026-08-25): 36 file, 188 test, xanh hết. Nhưng
`vitest.config.mts` có `environment: "node"` và mọi test đều mock Prisma — nghĩa là **không một
test nào** chạm tới browser, tới HTTP, hay tới một DB thật. Chưa từng có test nào chứng minh:
login rồi tạo được project, publish rồi trang public thấy nó, draft không lọt ra ngoài qua route
thật. Ba điều đó chỉ được verify **thủ công một lần** ở Phase 9/12/13.

**B. Lỗi production là vô hình.** `grep -rn "console\." src --include=*.ts --include=*.tsx` (bỏ
test) ra **đúng 2 kết quả**, cả hai trong `src/app/(public)/contact/actions.ts` (Resend). Mọi
catch block trong 6 CRUD action trả về string cho user rồi **không log gì**:

```ts
// src/app/admin/(protected)/projects/actions.ts — pattern lặp ở cả 6 model
} catch (error) {
  if (isUniqueSlugViolation(error)) return { error: "...", field: "slug" };
  return { error: "Something went wrong." };   // ← error biến mất tại đây
}
```

Một lỗi Prisma trên production hiện không để lại dấu vết nào.

**C. Rate limit không chặn được gì trên Vercel.** `src/lib/rate-limit.ts` giữ state trong một
`Map` in-process. Docstring của chính nó đã ghi nhận giới hạn này. Trên Vercel serverless mỗi
lambda instance có `Map` riêng → attempt rải qua nhiều instance không được đếm cùng nhau. Ảnh
hưởng hai chỗ: brute-force login (5/15 phút theo email) và `/contact` (3/giờ theo IP) — endpoint
công khai duy nhất có write, ghi vào DB và tiêu quota Resend.

**D. Cloudinary orphan.** `src/lib/admin/cloudinary.ts` chỉ có `createUploadSignature` và
`enforceMaxFileSize`; **không có** hàm destroy nào ngoài trường hợp file quá lớn. Nợ này đã được
ghi nhận có chủ đích ở Phase 11 ("chấp nhận để lại ảnh rác khi xoá record").

**Ngoài ra, nợ Phase 14 còn treo:** exit criterion #1 (đi hết nav/form bằng bàn phím thật) là ⚠️
và #5 (kiểm 3 breakpoint thật) là ❌ — không phải vì code sai, mà vì browser automation của
session đó không set `document.activeElement` như thao tác thật và `resize_window` khóa viewport.
**Playwright làm được cả hai** (`page.keyboard.press`, `setViewportSize`), nên phase này đóng luôn
hai mục đó thay vì cần một phase a11y thứ hai.

### Kết quả mong muốn

Một lệnh (`npx playwright test`) chứng minh được toàn bộ luồng người dùng thật còn sống; một lỗi
production tới được nơi có người thấy; hai lỗ hổng chống-lạm-dụng và một nguồn rác được đóng thật.

---

## 2. Quyết định đã chốt với maintainer

| # | Vấn đề | Chốt | Đã cân nhắc và loại |
|---|---|---|---|
| D1 | DB cho E2E | **Postgres service container trong CI job** — mỗi run một DB sạch, deterministic, không đụng dữ liệu thật, không tốn Neon | Neon branch riêng (2 CI run song song ghi đè nhau → flaky); chạy vào Vercel preview (preview dùng `DATABASE_URL` production → test sẽ ghi vào DB thật) |
| D2 | Phạm vi E2E | **Parametrized qua cả 6 domain + các flow đặc thù** — phủ đúng phần Phase 17 sẽ move | Chỉ critical path 1 model (5 domain còn lại không có lưới); 6 spec viết rời (6x code trùng); smoke tối thiểu |
| D3 | Observability | **`src/lib/logger.ts` + `@sentry/nextjs`** | Chỉ logger nội bộ (Vercel Runtime Logs không có alert, retention phụ thuộc plan → chỉ thấy lỗi nếu tình cờ mở dashboard); thêm Vercel Analytics (là analytics, không phải reliability) |
| D4 | Rate limit store | **Bảng Postgres qua Prisma** — không service mới, không env var mới | Upstash Redis (thêm service + 2 env + 2 dependency cho đúng 2 chỗ dùng); giữ in-memory |
| D5 | Thứ tự thực hiện | **Net trước, hardening sau** — E2E viết đối với code hiện tại làm baseline, rồi 3 thay đổi production-facing mới đi vào khi đã có lưới xanh | Hardening trước (mất baseline lúc sửa); vertical slice (lưới cho Phase 17 chỉ đủ ở PR cuối) |
| D6 | Cloudinary trong E2E | **`page.route()` stub response upload** — test đúng luồng UI, không gọi service ngoài | Gọi Cloudinary thật trong CI (cần secret, sinh rác asset, flaky) |

**Ghi chú về D5:** churn test được lo là không đáng kể — trong CI chỉ có một process, nên
rate-limit in-memory *vẫn hoạt động đúng*, test lockout pass cả trước và sau khi đổi store. Cái
thay đổi là **API** (xem §6), không phải hành vi quan sát được từ browser.

---

## 3. E2E infra

| Quyết định | Nội dung | Lý do |
|---|---|---|
| Vị trí | `e2e/` ở root, đặt tên `*.spec.ts` | `vitest.config.mts` có `include: ["src/**/*.test.ts"]`. Để ngoài `src/` **và** khác đuôi là hai lớp chặn độc lập để Vitest không nhặt file Playwright — một lớp là đủ, nhưng cả hai đều miễn phí |
| Browser | Chromium only + một Playwright project riêng cho mobile viewport | CI nhanh; portfolio không cần cross-browser matrix. Project mobile là cách gọn nhất để `responsive.spec.ts` (§4) chạy cùng bộ assertion ở width khác |
| Server | `webServer` = `npm run start`, chạy sau `npm run build`; `reuseExistingServer: !process.env.CI` | Test đúng production build. `revalidatePath` chỉ có ý nghĩa thật ở đó — `next dev` không có cache để invalidate, nên test `publish-visibility` sẽ pass vô nghĩa nếu chạy dev mode |
| DB | `services: postgres` trong CI job + `prisma migrate deploy` + `prisma db seed` | `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1` (set vô điều kiện trong `prisma.config.ts`) vô hại với Postgres không pooled — không cần đổi gì |
| Fixture | Dùng lại `prisma/seed.ts`, nhưng **export hằng số** (slug draft, slug published) ra module chung để E2E `import` | Seed đổi thì E2E fail lúc typecheck, không fail bí ẩn lúc runtime |
| Auth | Playwright `setup` project login một lần qua UI → `storageState` vào `e2e/.auth/admin.json` (gitignore) | Không login lại mỗi test |

### Cái bẫy phải thiết kế từ đầu: rate-limit tự khoá chính test

Login rate-limit là 5 lần fail / 15 phút **keyed theo email đã normalize**. Nếu test "sai mật
khẩu" và test "bị lockout" dùng chung email với `auth.setup.ts`, chúng sẽ khoá chính setup của
mình → flaky theo thứ tự chạy. **Bắt buộc ba email cho ba mục đích:**

| Email | Dùng ở | Được phép fail |
|---|---|---|
| `ADMIN_EMAIL` thật (từ env CI) | `auth.setup.ts` | không bao giờ |
| `wrong@e2e.local` | test sai creds | có, dưới ngưỡng |
| `lockout@e2e.local` | test lockout | có, cố ý vượt ngưỡng |

### Ghi chú nhỏ đã kiểm

`useUnsavedChangesGuard` dùng `beforeunload` + `event.preventDefault()`. Playwright tự dismiss
loại dialog này (khác `alert`/`confirm` native — loại đó mới treo session), nên không cần xử lý
đặc biệt. Tương tự, delete confirm trong admin là `AlertDialog` (component thật trong DOM), không
phải `confirm()` native → an toàn.

### Env cho CI job `e2e`

| Var | Giá trị | Ghi chú |
|---|---|---|
| `DATABASE_URL` | trỏ service container | **không** dùng `secrets.DATABASE_URL` |
| `AUTH_SECRET` | dummy, sinh trong job | |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | dummy, seed đọc | |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | SEO / absolute URL |
| `CLOUDINARY_*` | dummy | chỉ đọc lúc gọi hàm, không lúc build; upload bị stub (D6) |
| `RESEND_API_KEY` | dummy | contact action đã `try/catch` riêng Resend từ Phase 12 → lỗi gửi mail không rollback `ContactMessage`, nên test submit vẫn assert được |

---

## 4. Hình dạng bộ E2E

```
e2e/
  fixtures/
    auth.setup.ts          # login 1 lần → storageState
    seed-constants.ts      # re-export hằng số từ prisma/seed
    crud-models.ts         # bảng config 6 model + page-object dùng chung
  public/
    pages.spec.ts          # 7 route → 200 + <title> + nav active state
    draft-hiding.spec.ts   # draft 404 ở detail, vắng ở list      (invariant Phase 1 / C4)
    contact.spec.ts        # submit hợp lệ, lỗi validation + aria-describedby, honeypot
    a11y.spec.ts           # skip-link → #main-content, tab order, focus visible   ← nợ P14 #1
    responsive.spec.ts     # 375/768/1280, nav collapse, không overflow ngang      ← nợ P14 #5
  admin/
    auth.spec.ts           # chưa login → redirect; sai creds; lockout
    crud.spec.ts           # parametrized qua 6 model
    publish-visibility.spec.ts   # tạo draft → không thấy public → publish → thấy
    image-upload.spec.ts   # page.route() stub Cloudinary
    contact-messages.spec.ts     # mark read, delete
```

### Bảng config per-model

Đây là điểm cốt lõi để không copy-paste 6 lần (và là lý do D2 vừa trong một PR):

```ts
type CrudModel = {
  label: string;                                              // "Projects"
  listPath: string;                                           // "/admin/projects"
  fillRequired: (page: Page, unique: string) => Promise<void>;
  rowLocator: (page: Page, unique: string) => Locator;
};
```

Một test chạy 6 lần: `new` → `fillRequired` với giá trị unique theo run → submit → thấy row →
edit → sửa → thấy giá trị mới → delete qua `AlertDialog` → row biến mất.

`SiteSettings` là singleton (`id` luôn `"singleton"`) nên nó **không** có create/delete — trong
bảng config nó là entry biến thể "chỉ edit". Ghi ra đây vì đó là chỗ dễ tưởng là bug khi đọc
test sau này.

### Tại sao `publish-visibility.spec.ts` tách riêng

Đây là test duy nhất chứng minh chuỗi `revalidatePath` (C3) còn sống end-to-end: mọi write action
đều gọi `revalidatePath("/")` + list + detail + `/sitemap.xml`, nhưng chưa từng có gì tự động
kiểm điều đó. Nó cũng là test dễ vỡ nhất khi Phase 17 move action sang `src/modules/` — đúng lý do
phase này tồn tại.

---

## 5. Logger + Sentry

- `src/lib/logger.ts` là **điểm log duy nhất được phép** — cùng nguyên tắc "single enforcement
  point" đã dùng cho `queries.ts` (C4) và `parseSocialLinks` (C5). API:
  `logError(event, error, context?)`.
- **PII:** `context` nhận allowlist key cụ thể (`model`, `recordId`, `action`), **không** nhận
  object tự do. Không bao giờ log email người gửi hay nội dung `ContactMessage`. Sentry cấu hình
  `sendDefaultPii: false`.
- Gắn vào: 6 catch block CRUD action (đang swallow hoàn toàn — xem §1.B), 2 `console.error` sẵn có
  ở contact action, sign / `enforceMaxFileSize` failure, `authorize()` failure.
- Sentry: `@sentry/nextjs`, `tracesSampleRate: 0` — chỉ error, không tracing, để không đốt free
  tier (5k event/tháng).
- Env mới: `NEXT_PUBLIC_SENTRY_DSN` (**một** DSN duy nhất, mang prefix `NEXT_PUBLIC_` vì client
  config cũng phải đọc được — không tạo hai biến cho cùng một giá trị) và `SENTRY_AUTH_TOKEN`
  (chỉ CI, cho source map) → cập nhật `.env` **và** `.env.example` cùng lúc (rule CLAUDE.md).
  `SENTRY_AUTH_TOKEN` là build-time secret, không thuộc nhóm dev-tooling MCP (C6).
- **Bắt buộc trước khi code:** đọc `node_modules/next/dist/docs/` về `instrumentation.ts` /
  `onRequestError`. AGENTS.md cảnh báo Next 16 khác training data, và convention instrumentation
  là chỗ đã đổi nhiều lần giữa các bản Next.

---

## 6. Rate limit → Postgres

```prisma
model RateLimitEntry {
  key     String   @id      // namespaced: "login:<email>" | "contact:<ip>"
  count   Int      @default(0)
  resetAt DateTime
  @@index([resetAt])
}
```

**Đổi API, có chủ ý.** Hiện tại `isRateLimited()` rồi `recordAttempt()` là hai lời gọi →
read-modify-write, có race thật khi hai request đồng thời (bản in-memory che mất điều này vì nó
đồng bộ trong một process). Thay bằng **một** `hit(key): Promise<{ limited: boolean }>` cài bằng
`INSERT … ON CONFLICT (key) DO UPDATE` trong một statement `$executeRaw` — atomic ở tầng DB.
`clearAttempts()` giữ nguyên (login thành công thì xoá).

**Ngữ nghĩa off-by-one phải chốt ở đây, không để lúc implement tự đoán.** Bản hiện tại kiểm
`count >= max` **trước** khi ghi, nên với `max = 5`: 5 lần fail được phép, **lần thứ 6 bị chặn**.
Gộp thành một lời gọi làm mất thứ tự đó, nên định nghĩa cứng:

```
hit(key) = tăng count lên 1 (reset về 1 nếu row đã hết hạn), rồi trả về
           { limited: countMới > max }
```

→ `max = 5`: lần 1..5 trả `limited: false`, **lần 6 trả `limited: true`** — giữ nguyên hành vi cũ.
Thứ tự gọi trong login action: `hit()` trước, nếu `limited` thì reject ngay (không verify
password); auth thành công thì `clearAttempts()`. Nghĩa là login thành công cũng tăng rồi xoá —
vô hại, và giữ cho đường code chỉ có một nhánh.

- Namespace prefix **bắt buộc**: login key theo email, contact key theo IP, cùng một bảng, không
  được đụng nhau.
- Dọn row hết hạn: opportunistic `deleteMany({ resetAt: { lt: now } })` trên đường write — đúng
  tinh thần `sweepExpired()` hiện tại, và cần thiết vì `key` là attacker-controlled.
- `src/lib/rate-limit.test.ts` + `src/lib/auth/rate-limit.test.ts` phải viết lại (mock Prisma, như
  các test khác trong repo đang làm).

**Đánh đổi đã biết và chấp nhận:** mỗi request vào `/contact` giờ thành một DB write. Attacker
hammer endpoint sẽ tạo tải DB — vẫn rẻ hơn cái nó chặn được (write `ContactMessage` + quota
Resend), nhưng phải ghi ra để không tưởng là miễn phí.

---

## 7. Cloudinary orphan

Có **hai** nguồn orphan, và cái thường bị bỏ sót là cái phổ biến hơn:

1. Xoá record → ảnh của nó mồ côi.
2. **Đổi ảnh lúc edit → ảnh cũ mồ côi.** Xảy ra nhiều hơn hẳn.

Thêm `destroyAssetByUrl(url)` vào `src/lib/admin/cloudinary.ts`.

### Invariant an toàn — phần quan trọng nhất của section này

App lưu **URL đầy đủ**, không lưu `publicId`, nên phải parse URL ngược ra `public_id`. Việc này
nguy hiểm nếu làm cẩu thả: field ảnh có thể chứa bất cứ chuỗi gì admin gõ, không chỉ URL do
upload sinh ra. Chỉ destroy khi **cả ba** đúng:

1. host là `res.cloudinary.com`,
2. cloud name trong URL khớp `CLOUDINARY_CLOUD_NAME`,
3. folder trích ra khớp **đúng một** trong 8 folder của `UPLOAD_TARGETS`.

Không khớp → no-op im lặng. Nhờ vậy một URL gõ tay (hoặc URL cố ý dựng) không thể khiến app xoá
asset lạ trong account.

- Best-effort: `try/catch` + `logError`. Lỗi Cloudinary **không** được làm fail hay rollback DB
  write — cùng nguyên tắc đã dùng cho Resend ở Phase 12.
- Gọi ở đâu: **sau** khi DB write thành công, trong delete + update action của 5 model có field
  ảnh (`SiteSettings`, `Project`, `BlogPost`, `Skill`, `Testimonial`). `Project.galleryUrls` là
  mảng → set diff (URL cũ trừ URL mới).
- Test: unit test với `vi.mock("cloudinary")` — cover các case whitelist bị từ chối + tính đúng
  của set diff. Không E2E (service ngoài, xem D6).

---

## 8. Exit criteria

Mọi mục đều kiểm được; không mục nào là "đã review".

1. `npx playwright test` xanh cả local và CI; suite phủ create → edit → delete cho **cả 6** domain.
2. CI có job `e2e` chạy trên mọi PR vào `develop`, **và** đã chứng minh nó thật sự bắt lỗi bằng
   cách cố tình break một action rồi thấy job đỏ (không chỉ thấy job xanh).
3. Keyboard nav + 3 viewport (375 / 768 / 1280) được assert bằng Playwright thật → **đóng nợ
   Phase 14 #1 và #5**.
4. Một lỗi Prisma cố tình gây ra xuất hiện trong Sentry **và** trong structured log.
5. Rate-limit: attempt thứ 6 bị chặn **dù đếm từ hai process khác nhau** — verify bằng một script
   `tsx` gọi `hit()` 5 lần rồi **một process thứ hai** gọi lần 6 và nhận `limited: true`, cùng một
   DB. Không verify qua browser (browser không chứng minh được điều đang cần chứng minh là *state
   chia sẻ*). Đây là bài test mà bản in-memory không bao giờ pass được → nó chứng minh fix là
   thật, không phải chỉ chạy được.
6. Xoá record có ảnh → asset biến mất thật trên Cloudinary (verify qua API, không suy luận); URL
   ngoài whitelist → no-op, không destroy gì.
7. `docs/CHANGELOG.md` + `docs/ROADMAP.md` cập nhật; `docs/LESSONS.md` nếu có bài học lâu dài.

---

## 9. Ngoài scope — nói rõ để không hiểu là bỏ sót

- **Quét ngược orphan đã tồn tại** từ Phase 11 → việc thủ công một lần, ghi vào CHANGELOG, không code.
- Vercel Analytics / Speed Insights, Turnstile, E2E chạy vào Vercel preview, test hành vi riêng
  của Neon pooler.
- Refactor `src/modules/` → Phase 17.
- Sentry tracing / session replay / performance monitoring — chỉ error tracking (xem §5).

### Rủi ro

| Rủi ro | Giảm nhẹ |
|---|---|
| CI dài thêm ~3–5 phút (build + Playwright) | Chromium only, một shard; chấp nhận |
| `/contact` giờ có DB write mỗi request | Đã bàn ở §6; vẫn rẻ hơn cái nó chặn |
| E2E phụ thuộc `prisma/seed.ts` | Hằng số export dùng chung (§3) → fail ở typecheck, không ở runtime |
| Sentry free tier bị đốt | `tracesSampleRate: 0`, chỉ error |
| Test parametrized khó đọc hơn 6 file rời | Bảng config có type rõ + page-object đặt tên theo hành vi |

---

## 10. Chia PR

| PR | Nội dung | Xanh nghĩa là |
|---|---|---|
| 1 | Playwright + `playwright.config.ts` + CI job `e2e` + `auth.setup.ts` + 1 smoke spec | Job e2e chạy thật trên PR |
| 2 | `e2e/public/*` (5 spec) | Nợ Phase 14 #1 và #5 đóng |
| 3 | `e2e/admin/*` (5 spec, parametrized 6 model) | Lưới cho Phase 17 hoàn chỉnh |
| 4 | `src/lib/logger.ts` + Sentry + gắn vào mọi catch | Lỗi cố ý hiện trong Sentry |
| 5 | `RateLimitEntry` + migration + `hit()` + viết lại 2 test | Exit criterion #5 pass |
| 6 | `destroyAssetByUrl` + gọi ở 5 model + unit test | Asset biến mất thật; URL lạ no-op |
| 7 | CHANGELOG + ROADMAP + LESSONS | Session sau resume được chỉ từ doc |

PR 1–3 là "net", PR 4–6 là "hardening" — thứ tự này là D5, không đổi được mà vẫn giữ được ý nghĩa
của baseline.
