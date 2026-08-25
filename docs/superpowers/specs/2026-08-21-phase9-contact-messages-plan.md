# Phase 9 (đóng phase) — `ContactMessage` admin view + mark-as-read

- **Ngày chốt plan**: 2026-08-21
- **Trạng thái**: ✅ Plan đã duyệt — **chưa implement dòng nào**
- **Nhánh sẽ dùng**: `feature/phase9-admin-contact-messages`, tạo từ `develop`

> Đây là slice cuối để **đóng Phase 9**. Nó cũng là cổng chặn của Phase 10 —
> xem `docs/superpowers/specs/2026-08-21-phase10-ui-ux-overhaul-design.md` §0.

---

## 0. RESUME — đọc mục này trước nếu session vừa `/clear`

### Trạng thái repo lúc ghi plan này

| Việc | Trạng thái |
|---|---|
| Nhánh đang đứng | `docs/phase10-design-spec` (tạo từ `develop` = `d723a2c`), chưa push |
| Đã commit trên nhánh đó | `20e73b5` — spec Phase 10 (703 dòng). ⚠️ **Message là placeholder rác** (`"Implement feature X…"`), vi phạm Conventional Commits. Local + chưa push → amend an toàn (xem dưới). |
| Còn staged, chưa commit | `docs/superpowers/specs/2026-08-21-phase9-contact-messages-plan.md` (file này) + entry mới trong `docs/CHANGELOG.md` |
| `develop` | Đồng bộ với `origin/develop` tại `d723a2c` |
| Phase 9 | 6 slice CRUD model xong; **còn `ContactMessage` (file này) + verify exit criterion 4** |
| Phase 10 | Đã có design spec đầy đủ, **chưa bắt đầu**, bị chặn tới khi Phase 9 đóng |

### Bước tiếp theo, đúng thứ tự

```bash
# 0. Sửa message rác của 20e73b5 (local, chưa push → an toàn)
git commit --amend -m "docs: add Phase 10 UI/UX overhaul design spec"

# 1. Commit phần docs còn lại (maintainer tự làm — hard rule: assistant không tự commit)
git commit -m "docs: add Phase 9 contact-messages plan and planning changelog entry"

# 2. Tạo nhánh Phase 9 sạch (phải sau bước 1, nếu không staged file đi theo sang nhánh mới)
git checkout develop
git checkout -b feature/phase9-admin-contact-messages

# 3. Implement theo §2–§5 dưới đây
# 4. npm run lint && npm run typecheck && npm run test && npm run build
# 5. Review git diff — KHÔNG commit, maintainer tự commit
```

### Hai câu hỏi Phase 10 còn treo (không chặn Phase 9)

1. **Icon brand cho social link ở footer** — `lucide-react@1.31` đã bỏ brand icon. 3 phương án ở spec Phase 10 §7; khuyến nghị: text link + `ArrowUpRightIcon`, zero dep.
2. **jsdom + RTL** — khuyến nghị để ngoài Phase 10 (`chore/vitest-jsdom-rtl` ngay sau). Nếu muốn có *trong* Phase 10 thì **bắt buộc vào làm PR 0**, trước khi có component nào.

---

## 1. Phát hiện định hình plan này

**`ContactMessage` KHÔNG phải model CRUD thứ 7.** Admin không bao giờ tạo hay sửa message — public contact form (Phase 12 sau khi dồn số) mới là thứ tạo ra chúng. Admin chỉ: xem list → xem chi tiết → đánh dấu đã đọc.

Hệ quả: **không form, không `contact-message-schema.ts`, không `*-form.tsx`, không `*-form.module.scss`.** Slice này nhỏ hơn hẳn 6 slice kia và chỉ đẻ ra **2 file SCSS duplicate** thay vì 5.

Ba khác biệt so với pattern hiện có:

1. **Không tái dùng được `src/lib/queries.ts`.** `Skill` tái dùng `getSkills()` từ query layer public (không có draft nên vô hại — xem comment đầu `src/lib/admin/skills.ts`). `ContactMessage` thì **tuyệt đối không** — public không bao giờ được đọc dữ liệu người khác gửi. `src/lib/admin/contact-messages.ts` là reader duy nhất, đúng C4.
2. **`revalidatePath` không có đích public nào** — message không render ở bất kỳ trang public nào. Chỉ revalidate route admin.
3. **`prisma/seed.ts` không tạo message nào** (verify: `grep -n "contactMessage" prisma/seed.ts` → rỗng) → list sẽ rỗng, không verify được UI. Đã chốt: thêm seed.

### Model (đã tồn tại, không cần migration)

`prisma/schema.prisma:126`:
```prisma
model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  subject   String?          // optional
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 2. Quyết định đã chốt với maintainer

| # | Quyết định | Lý do |
|---|---|---|
| Q1 | **KHÔNG làm chức năng xoá message** | Roadmap ghi mục tiêu Phase 9 là "xem và đánh dấu đã đọc" — không nhắc xoá. `ContactMessage` là dữ liệu **duy nhất** do người ngoài gửi và schema **không có soft-delete** → xoá là mất vĩnh viễn, xứng đáng là một quyết định riêng thay vì thêm kèm. |
| Q2 | **Thêm ~4 message mẫu vào `prisma/seed.ts`** | 2 unread, 2 read, 1 không có `subject` (test field optional). Không có seed thì không verify được list/sort/toggle/chi tiết. |
| Q3 | **Mark-read là toggle tường minh**, không auto-mark khi mở chi tiết | Auto-mark làm "unread" thành tín hiệu không đáng tin; một cú mở nhầm là mất dấu. |
| Q4 | **Có zod validate trong action** dù không có form | Đối số của server action **do client kiểm soát ở runtime** — TypeScript không chặn gì. Đây là bảo mật thật, không phải nghi thức. Xem §4. |
| Q5 | **Cố ý sao chép nợ duplicate** (`useMemo`+`eslint-disable`, SCSS trùng) | Phase 10 PR 14 xoá cả 6 một lượt. Đừng "dọn sạch trước" ở đây — `ContactMessage` chính là phép thử thứ 6 cho `AdminDataTable`. |

---

## 3. Files

### Tạo mới

| File | Nội dung |
|---|---|
| `src/lib/admin/contact-messages.ts` | `getAllContactMessagesAdmin()` → `prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } })`; `getContactMessageByIdAdmin(id)` → `findUnique({ where: { id } })`. **Kèm header comment C4** copy khuôn từ `src/lib/admin/testimonials.ts`. |
| `src/lib/admin/contact-messages.test.ts` | Mirror `src/lib/admin/testimonials.test.ts` — mock `@/lib/prisma`, khẳng định shape query. |
| `src/app/admin/(protected)/contact-messages/page.tsx` | List page. `export const metadata = { title: "Messages" }`. Không có nút "New" (admin không tạo message). |
| `…/contact-messages/page.module.scss` | Sẽ **giống hệt** 5 file list page kia — copy nguyên. |
| `…/contact-messages/contact-messages-table.tsx` | Table v9. Cột: `Read` · `From` · `Subject` · `Received` · `Actions`. |
| `…/contact-messages/contact-messages-table.module.scss` | Sẽ **giống hệt** 5 file `*-table.module.scss` kia — copy nguyên. |
| `…/contact-messages/[id]/page.tsx` + `page.module.scss` | Trang chi tiết — body message có thể dài, không nhét vừa cell. Hiện `name`, `email` (mailto), `subject`, `createdAt`, `message` (plain text, **không** qua `<Markdown>` — đây là input người lạ, không phải nội dung tác giả), nút toggle read, back-link về list. |
| `…/contact-messages/actions.ts` | `setContactMessageReadAction(id, read)`. |
| `…/contact-messages/actions.test.ts` | Xem §5. |

### Sửa

| File | Thay đổi |
|---|---|
| `src/app/admin/(protected)/layout.tsx` | Thêm `<Link href="/admin/contact-messages">Messages</Link>` — link nav thứ 8. Diff 1 dòng. |
| `prisma/seed.ts` | ~4 `contactMessage` mẫu (Q2). |

---

## 4. Action — khuôn bắt buộc giữ

```ts
"use server";
// src/app/admin/(protected)/contact-messages/actions.ts

export type ContactMessageActionState = { error: string } | undefined;

export async function setContactMessageReadAction(
  id: string,
  read: boolean
): Promise<ContactMessageActionState> {
  // 1. auth() LÀ DÒNG ĐẦU TIÊN — C1, không phụ thuộc middleware (src/proxy.ts chỉ là UX)
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  // 2. zod safeParse — C2. Đối số server action do client kiểm soát ở runtime,
  //    TypeScript không chặn gì. Đây là chỗ DUY NHẤT trong repo mà đối số action
  //    thực sự có thể do người ngoài nặn ra, nên parse là bảo mật thật.
  const parsed = z
    .object({ id: z.string().min(1), read: z.boolean() })
    .safeParse({ id, read });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // 3. existence check trước khi mutate — khuôn của 6 model kia
  const existing = await getContactMessageByIdAdmin(parsed.data.id);
  if (!existing) return { error: "Message not found." };

  await prisma.contactMessage.update({
    where: { id: parsed.data.id },
    data: { read: parsed.data.read },
  });

  // 4. revalidate — CHỈ route admin. Không có đích public nào.
  revalidatePath("/admin/contact-messages");
  revalidatePath(`/admin/contact-messages/${parsed.data.id}`);
  // KHÔNG redirect() — ở lại chỗ cũ, để client router.refresh()
}
```

⚠️ **Không thêm `redirect()`.** Toggle read phải ở lại chỗ cũ. (Ghi chú liên quan: ở 5 model kia, `toast.success` sau `redirect()` là **code chết** — code sau `redirect()` không bao giờ chạy. Phase 10 PR 15 sửa việc đó; ở đây chỉ cần đừng lặp lại lỗi.)

---

## 5. Test

**`src/lib/admin/contact-messages.test.ts`** — khuôn từ `src/lib/admin/testimonials.test.ts`:
- `getAllContactMessagesAdmin()` gọi Prisma với đúng `{ orderBy: { createdAt: "desc" } }`.
- `getContactMessageByIdAdmin(id)` chỉ tra theo `id`.

**`src/app/admin/(protected)/contact-messages/actions.test.ts`** — khuôn từ `…/skills/actions.test.ts` (chú ý comment về `auth` bị overload: phải `const mockedAuth = auth as unknown as Mock`, **không** dùng `vi.mocked(auth)`):
1. `mockedAuth` → `null` → `{ error: "Unauthorized." }` **và** `prisma.contactMessage.update` **không được gọi** (C1).
2. **Case mới, chưa model nào có:** `mockedAuth` → có session, nhưng `read` không phải boolean → `{ error }` và `prisma.contactMessage.update` **không được gọi**.
   → Đây chính là lỗ hổng coverage đã ghi ở spec Phase 10 §11 rủi ro #5 (`actions.test.ts` hiện có bắt được việc gỡ auth check nhưng **không** bắt được việc gỡ `safeParse` server-side). Slice này bịt cho model của nó; Phase 10 PR 15 bịt cho 6 model còn lại.

---

## 6. Verify

```bash
npm run lint && npm run typecheck && npm run test && npm run build
git diff        # review — KHÔNG commit
```

Kiểm bằng tay (local dev, sau khi `prisma db seed`):
- `/admin/contact-messages` hiện 4 row, sort theo `createdAt` giảm dần.
- Row không có `subject` không vỡ layout.
- Toggle read đổi trạng thái và giữ nguyên sau reload.
- `/admin/contact-messages/[id]` hiện đủ nội dung, back-link chạy.
- Sign out → vào thẳng `/admin/contact-messages` → phải redirect về login.

---

## 7. Việc còn lại để đóng Phase 9 (KHÔNG thuộc slice code này)

**Exit criterion 4 — verify `revalidatePath` trên preview deployment thật.** Đã implement ở cả 6 model nhưng mới chỉ verify ở local dev. Cần làm khi deploy:

1. Trên preview URL, publish một `Project` đang DRAFT → trang `/projects` public phải hiện nó **không cần rebuild**.
2. Unpublish lại → phải biến mất.
3. Lặp cho một `BlogPost` trên `/blog`.
4. Đổi `siteName` ở `/admin/settings` → phải đổi trên **mọi** route public (nó dùng `revalidatePath("/", "layout")` chứ không phải một path đơn, vì `siteName` render qua layout public).

Sau khi cả 2 việc (slice code này + verify trên) xong: cập nhật `docs/ROADMAP.md` mục Phase 9 → ✅, xoá dòng "Còn lại để đóng phase", rồi **mở khoá Phase 10**.

---

## 8. Rủi ro

Thấp. Không migration (model đã có), không đụng `src/lib/queries.ts`, không đụng 6 slice cũ, không thêm dependency.

Điểm duy nhất đáng chú ý: sửa `src/app/admin/(protected)/layout.tsx` là chạm file dùng chung của **mọi** route admin — nhưng diff chỉ 1 dòng thêm link. Nếu diff ở file đó lớn hơn 1 dòng thì có gì đó sai.
