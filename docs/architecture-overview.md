# Architecture Overview — Prebooking Backoffice

> เอกสารสำหรับประชุม dev เพื่อทำความเข้าใจโครงสร้างระบบ
> อัปเดตล่าสุด: 11 มีนาคม 2026 (rev 2 — SSO direct flow, Vercel deployment)

---

## 1. ภาพรวมระบบ

**Prebooking Backoffice** คือ internal admin tool สำหรับทีม ops จัดการ pre-order อุปกรณ์มือถือ ฟีเจอร์หลัก:

- ดู Dashboard stats และรายการ prebooking ทั้งหมด
- Import ข้อมูลจาก Excel (quota, dates, timeslots)
- Export รายงานเป็น Excel / CSV

**สถานะปัจจุบัน:** Frontend พร้อมทั้งหมด, API routes ทำงานด้วย **mock data** — รอต่อ backend จริง

---

## 2. Tech Stack

| Layer | Technology | Version | เหตุผลที่เลือก |
|-------|-----------|---------|--------------|
| Framework | **Nuxt 4** (Vue 3) | 4.x | Full-stack framework เดียว — frontend + BFF API, file-based routing, auto-import |
| Language | **TypeScript** | strict mode | Type safety ตั้งแต่ compile time, ป้องกัน runtime errors |
| State | **Pinia** | latest | TypeScript-native, Devtools integration, module pattern |
| UI Components | **Reka UI v2** | 2.9.0 | Headless — ยืดหยุ่น style 100%, accessible by default |
| Styling | **Tailwind CSS v4** | 4.2.1 | Utility-first, ไม่มี custom CSS ซ้อนกัน |
| Forms | **VeeValidate + Zod** | v4 + v3 | Schema validation แบบ type-safe |
| Excel (server) | **ExcelJS** | 4.4.0 | Streaming read/write — รองรับ large files โดยไม่ OOM |
| Excel (client) | **xlsx (SheetJS)** | 0.18.5 | Lightweight สำหรับ client-side preview |
| Auth | **nuxt-auth-utils** | 0.5.29 | SSO/OAuth2 built-in, session management |
| i18n | **@nuxtjs/i18n** | 10.2.3 | ภาษาไทย default, English สลับได้ |
| Icons | **Lucide Vue Next** | 0.577.0 | Consistent icon set, tree-shakable |
| Composable utils | **@vueuse/core** | 14.2.1 | Vue composition utilities (useLocalStorage, etc.) |
| Table | **@tanstack/vue-table** | 8.21.3 | Headless table logic (sort, filter, pagination) |

---

## 3. โครงสร้างโฟลเดอร์

```
prebooking-backoffice/
│
├── app/                          ← Nuxt 4 source root (~/alias ชี้มาที่นี่)
│   ├── pages/                    ← Route pages (file-based routing)
│   │   ├── index.vue             ← Dashboard
│   │   ├── display.vue           ← Prebooking detail
│   │   ├── export.vue            ← Export Excel/CSV
│   │   └── import/
│   │       ├── quota.vue         ← Import product quota
│   │       ├── dates.vue         ← Import booking dates
│   │       └── timeslots.vue     ← Import pickup timeslots
│   │
│   ├── layouts/
│   │   └── default.vue           ← App shell (sidebar + header + breadcrumb)
│   │
│   ├── components/
│   │   ├── layout/               ← AppSidebar, AppHeader, AppBreadcrumb, LanguageSwitcher
│   │   └── ui/                   ← Reka-UI components (auto-import, pathPrefix: false)
│   │       └── button/, input/, table/, dialog/, sheet/, badge/, ...
│   │
│   ├── stores/                   ← Pinia stores (auto-imported)
│   │   ├── prebookingStore.ts    ← State: รายการ + stats + pagination + filters
│   │   └── importStore.ts        ← State: import job lifecycle
│   │
│   ├── composables/              ← Business logic wrappers
│   │   ├── usePrebooking.ts      ← Expose store refs + helpers
│   │   ├── useExcelImport.ts     ← Upload → preview → process flow
│   │   ├── useExcelExport.ts     ← Export job + auto-download
│   │   └── useAuth.ts            ← Session check, login/logout
│   │
│   ├── middleware/
│   │   └── auth.global.ts        ← Client route guard (redirect ถ้าไม่ login)
│   │
│   ├── types/
│   │   ├── prebooking.ts         ← Prebooking, PrebookingFilter, PrebookingStats
│   │   ├── excel.ts              ← ImportPreviewResult, ImportJobStatus, ExportJob
│   │   └── auth.ts               ← SSOUser, UserRole, AuthSession
│   │
│   └── utils/
│       └── cn.ts                 ← clsx + tailwind-merge helper
│
├── server/
│   ├── api/                      ← Nitro API routes (auto-mapped)
│   │   ├── prebooking/           ← GET (list) / POST (create)
│   │   ├── import/               ← upload.post, process.post, status/[jobId].get
│   │   ├── export/               ← generate.post, history.get
│   │   ├── auth/                 ← sso.get, callback.get
│   │   └── templates/            ← quota.get, dates.get, timeslots.get
│   │
│   ├── middleware/
│   │   └── auth.ts               ← Server route guard (401 ถ้าไม่มี session)
│   │
│   └── utils/
│       ├── backendProxy.ts       ← Wrapper สำหรับเรียก external backend API
│       ├── jobManager.ts         ← In-memory job tracking (Map<jobId, JobStatus>)
│       ├── excelStreamParser.ts  ← Stream-based Excel parser (ExcelJS WorkbookReader)
│       ├── excelStreamGenerator.ts ← Stream-based Excel writer (ExcelJS WorkbookWriter)
│       └── chunkProcessor.ts     ← Process arrays in configurable chunks
│
├── i18n/locales/
│   ├── th.json                   ← Thai (default, 245 lines)
│   └── en.json                   ← English (parallel structure)
│
├── app/assets/fonts/BetterTogether/ ← Custom font (processed by Vite — base URL safe)
├── public/fonts/BetterTogether/  ← Static font fallback (legacy)
├── nuxt.config.ts                ← Config ทั้งหมด
├── tsconfig.json                 ← TypeScript strict
└── eslint.config.ts              ← Lint rules
```

---

## 4. Architecture Pattern

### Data Flow หลัก

```
┌─────────────────────────────────────────────────────────────┐
│  Page (app/pages/*.vue)                                      │
│    useHead({ title })  /  definePageMeta({ layout })         │
│    ↓ calls                                                   │
│  Composable (app/composables/use*.ts)                        │
│    storeToRefs() → reactive refs                             │
│    helper methods (refresh, delete, export...)               │
│    ↓ uses                                                    │
│  Pinia Store (app/stores/*.ts)                               │
│    state: T[] + pagination + loading + error                 │
│    actions: fetch, create, update (immutable pattern)        │
│    ↓ calls                                                   │
│  Nitro API Route (server/api/**/*.ts)                        │
│    validate input → call backendProxy (or mock)              │
│    ↓ calls (when backend is live)                            │
│  External Backend (BACKEND_API_URL)                          │
└─────────────────────────────────────────────────────────────┘
```

### ทำไมถึงแยก Store กับ Composable?

| ชั้น | หน้าที่ | อย่าใส่ |
|------|--------|--------|
| **Store** | State + API calls + error handling | UI logic, DOM refs |
| **Composable** | Expose refs + helper methods | Direct state mutation |
| **Page** | Consume composable + render UI | Business logic |

---

## 5. Code Patterns หลัก

### 5.1 Store + Composable Pattern

```typescript
// stores/prebookingStore.ts — State & actions
export const usePrebookingStore = defineStore('prebooking', {
  state: () => ({
    prebookings: [] as Prebooking[],
    total: 0,
    isLoading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchPrebookings(filter: PrebookingFilter) {
      this.isLoading = true
      try {
        const res = await $fetch<PrebookingListResponse>(`/api/prebooking?${qs}`)
        // Immutable: สร้าง array ใหม่เสมอ ไม่ mutate ของเดิม
        this.prebookings = [...res.data]
        this.total = res.total
      } catch (err) {
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    }
  }
})

// composables/usePrebooking.ts — Expose to pages
export const usePrebooking = () => {
  const store = usePrebookingStore()
  const { prebookings, isLoading, error } = storeToRefs(store)  // reactive refs

  return {
    prebookings, isLoading, error,
    fetchPrebookings: store.fetchPrebookings,
    refresh: () => store.fetchPrebookings(store.currentFilter),
  }
}

// pages/index.vue — Consume only
const { prebookings, isLoading, fetchPrebookings } = usePrebooking()
onMounted(() => fetchPrebookings({ page: 1, limit: 20 }))
```

---

### 5.2 Job-based Async Pattern (Import / Export)

สำหรับ operation ที่ใช้เวลานาน (ประมวลผล Excel ขนาดใหญ่):

```
Client                          Server
  │                               │
  ├─ POST /api/import/upload ────►│ สร้าง job, parse preview
  │◄─ { jobId, preview } ─────────┤
  │                               │
  ├─ POST /api/import/process ───►│ เริ่ม process async
  │◄─ { jobId } ──────────────────┤
  │                               │
  ├─ GET /api/import/status/{id} ►│  ← poll ทุก 2 วินาที
  │◄─ { status, progress: 45% } ──┤
  │                               │
  ├─ GET /api/import/status/{id} ►│
  │◄─ { status: 'completed' } ────┤ ← หยุด poll
```

Job states: `pending` → `processing` → `completed` / `failed`

---

### 5.3 Excel Streaming Pattern

**ปัญหา:** ไฟล์ 50MB / 100,000 rows จะ OOM ถ้าโหลดทั้งหมดเข้า memory

**วิธีแก้:** ใช้ ExcelJS streaming API

```typescript
// server/utils/excelStreamParser.ts
const workbook = new ExcelJS.stream.xlsx.WorkbookReader(stream, {})
for await (const worksheet of workbook) {
  for await (const row of worksheet) {
    // ประมวลผลทีละ row — ไม่เก็บทั้งหมด
    onRow?.(mapRowToObject(headers, row.values), rowIndex)
  }
}

// server/utils/chunkProcessor.ts
// ส่ง backend ทีละ 500 rows (config: excel.chunkSize)
for (let i = 0; i < total; i += chunkSize) {
  const chunk = data.slice(i, i + chunkSize)
  await processFn(chunk)
  onProgress?.(processed += chunk.length, total)
}
```

---

### 5.4 i18n-First Pattern

ทุก text ในหน้า UI ต้องผ่าน translation key เสมอ

```typescript
// เพิ่ม key ใน i18n/locales/th.json และ en.json ก่อน
{ "import": { "upload": { "title": "อัปโหลดไฟล์" } } }

// ใน template
{{ $t('import.upload.title') }}
```

Structure ของ locale keys:
- `app.*` — ชื่อแอป
- `nav.*` — เมนู navigation
- `pages.*` — ชื่อหน้า
- `home.*` — Dashboard
- `import.*` — Import flow
- `export.*` — Export page
- `toast.*` — Notification messages
- `status.*` — Prebooking status labels

---

## 6. Pages & Routing

ทุก route ต้อง login — ไม่มีหน้า public

| Route | File | Layout |
|-------|------|--------|
| `/` | `pages/index.vue` | default |
| `/display` | `pages/display.vue` | default |
| `/export` | `pages/export.vue` | default |
| `/import/quota` | `pages/import/quota.vue` | default |
| `/import/dates` | `pages/import/dates.vue` | default |
| `/import/timeslots` | `pages/import/timeslots.vue` | default |

**Server OAuth routes** (ไม่ใช่ Nuxt pages — Nitro handles โดยตรง):

| Route | File | หน้าที่ |
|-------|------|--------|
| `/auth/google` | `server/routes/auth/google.get.ts` | เริ่ม/รับ Google OAuth callback |
| `/auth/logout` | `server/routes/auth/logout.get.ts` | Clear session → redirect `/auth/google` |

---

## 7. Authentication Flow

ไม่มีหน้า login — ผู้ใช้ที่ยังไม่ได้ login จะถูก redirect ไป Google OAuth ทันที

```
Browser                    Nuxt Client              Nitro Server
   │                           │                         │
   ├─ เข้า / ──────────────────►│                         │
   │                    auth.global.ts                    │
   │                    loggedIn? No                      │
   │◄─ redirect /auth/google (external) ─────────────────┤
   │                           │                         │
   ├─ GET /auth/google ────────────────────────────────►  │
   │                           │         google.get.ts   │
   │                           │         redirect → Google│
   │◄─ Google OAuth consent ───────────────────────────── │
   │                           │                         │
   ├─ Google callback → /auth/google?code=... ──────────►│
   │                           │         setUserSession()│
   │◄─ redirect / ─────────────────────────────────────── │
   │                           │                         │
   ├─ เข้า / ──────────────────►│                         │
   │                    loggedIn? Yes → แสดงหน้า          │
```

**Logout flow:**
```
กด Logout → GET /auth/logout → clearUserSession() → redirect /auth/google → Google consent
```

**Client guard** — [app/middleware/auth.global.ts](../app/middleware/auth.global.ts):
ถ้า `!loggedIn.value` → `navigateTo('/auth/google', { external: true })`

**Server guard** — [server/middleware/auth.ts](../server/middleware/auth.ts):
ถ้าเรียก `/api/prebooking`, `/api/import`, `/api/export` โดยไม่มี session → HTTP 401

**Static build** (`NUXT_PUBLIC_AUTH_ENABLED=false`):
middleware return early — ไม่มี redirect ใดๆ (ใช้สำหรับ GitHub Pages preview)

---

## 8. UI System

**Layout Default** (`app/layouts/default.vue`):
- Collapsible sidebar (left) + Header (top) + Breadcrumb + Main content
- Responsive: sidebar เป็น overlay บน mobile
- Layout เดียวสำหรับทุกหน้า (ไม่มี auth layout แล้ว)

**Component Library — Reka UI:**
ทุก UI component เป็น headless (ไม่มี default style) styled ด้วย Tailwind

```
UButton, UInput, UTable, USelect, UBadge
UDialog, USheet (Slideover), UDropdownMenu
UPagination, UForm, UFormField, UAvatar
```

**cn() utility** (`app/utils/cn.ts`):
```typescript
// merge Tailwind classes, resolves conflicts
cn('px-4 py-2', isActive && 'bg-red-600', className)
```

---

## 9. Environment Variables

```bash
# Backend
BACKEND_API_URL=http://localhost:8080        # URL external backend

# Google OAuth — nuxt-auth-utils อ่านชื่อนี้โดยตรง
# ตั้งค่าใน Google Console → Authorized redirect URI: https://<domain>/auth/google
NUXT_OAUTH_GOOGLE_CLIENT_ID=...
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=...

# Session — encrypt cookie session
NUXT_SESSION_PASSWORD=...                    # ต้อง >= 32 chars (openssl rand -base64 32)

# Optional
NUXT_APP_BASE_URL=/                          # Base path (default: /)
NUXT_PUBLIC_AUTH_ENABLED=true                # false สำหรับ static build (GitHub Pages)
```

### Deployment targets

| Platform | AUTH_ENABLED | APP_BASE_URL | build command |
|----------|-------------|-------------|---------------|
| **Vercel** | `true` | `/` | `nuxt build` |
| **Railway / VPS** | `true` | `/` | `nuxt build` |
| **GitHub Pages** (preview) | `false` | `/prebooking-backoffice/` | `nuxt generate` |

---

## 10. ข้อดี / ข้อเสีย / ความเหมาะสม

### ข้อดี

| ข้อดี | รายละเอียด |
|-------|-----------|
| Full-stack เดียว | Nuxt ครอบคลุม frontend + BFF API — ลด context switching |
| Type safety | TypeScript strict ทั้งหมด — catch errors ก่อน runtime |
| Large file support | Excel streaming 50MB / 100k rows โดยไม่ OOM |
| UX ดี | Job polling pattern → ผู้ใช้เห็น progress bar แบบ real-time |
| UI ยืดหยุ่น | Reka UI headless → ปรับ style ได้ทุกอย่างโดยไม่ override |
| Dev velocity | Mock data → frontend dev ได้ทันทีโดยไม่รอ backend |
| i18n พร้อม | เพิ่มภาษาใหม่ได้ง่าย — แค่เพิ่ม locale file |
| Auto-import | Pages, stores, composables, components — ไม่ต้อง import มือ |

### ข้อเสีย / ข้อควรระวัง

| ข้อเสีย | ผลกระทบ | วิธีแก้ |
|--------|--------|--------|
| **Job manager = in-memory** | Restart server แล้ว job ที่กำลัง process หาย | ย้ายไป Redis / database |
| **Mock API ทั้งหมด** | ยังใช้งานจริงไม่ได้ | ต่อ backendFetch() เมื่อ backend พร้อม |
| **ไม่มี test framework** | ไม่มี test coverage | เพิ่ม Vitest + Playwright |
| **Nuxt 4 ใหม่มาก** | Community resource น้อยกว่า v3 | ดู official docs + migration guide |
| **SSO direct redirect** | ถ้า OAuth error จะ loop กลับ Google | error ปัจจุบัน retry /auth/google |

### ความเหมาะสม

✅ **เหมาะมากสำหรับ:**
- Internal admin tools (ผู้ใช้น้อย, ใช้งานหนัก)
- Team เล็ก-กลาง ที่ต้องการ full-stack JS
- งานที่ต้องการ Excel import/export ขนาดใหญ่
- ระบบที่ต้องการ SSO integration

⚠️ **อาจ over-engineered สำหรับ:**
- CRUD-only app ไม่มี file processing
- กรณีที่ backend ทำ business logic ทั้งหมด และ frontend แค่แสดงผล

📈 **Scale ได้ถ้า:**
- แทน in-memory job manager ด้วย BullMQ + Redis
- ใช้ CDN สำหรับ generated Excel files
- เพิ่ม rate limiting บน upload endpoints

---

## 11. Roadmap (สิ่งที่ยังต้องทำก่อน Go-Live)

### Done ✅
- [x] Google SSO direct flow (ไม่มีหน้า login)
- [x] Font ใช้ Vite asset pipeline (รองรับ base URL ทุก deployment)
- [x] Vercel deployment workflow (`.github/workflows/deploy-vercel.yml`)
- [x] `.env.example` ด้วย env vars ที่ถูกต้อง

### Pending
- [ ] **ต่อ backend API จริง** — แทน mock responses ทุก route ด้วย `backendFetch()`
- [ ] **Job persistence** — ย้าย `jobManager.ts` จาก in-memory Map → Redis / DB
- [ ] **Test framework** — เพิ่ม Vitest (unit) + Playwright (E2E)
- [ ] **Export polling** — เพิ่ม status endpoint สำหรับ export job
- [ ] **Multipart upload** — ทำ real streaming upload แทน mock
- [ ] **Error monitoring** — เพิ่ม Sentry หรือ equivalent
- [ ] **Rate limiting** — เพิ่มบน `/api/import/upload`
- [ ] **OAuth error page** — แสดง error message แทน retry loop เมื่อ Google OAuth fail

---

## 12. Quick Reference — Key Files

| ต้องการทำอะไร | ไฟล์ที่ต้องดู |
|------------|-------------|
| เพิ่ม page ใหม่ | `app/pages/` + เพิ่ม nav ใน `AppSidebar.vue` |
| เพิ่ม API endpoint | `server/api/` (file name = route) |
| เปลี่ยน state logic | `app/stores/` → `app/composables/` |
| เพิ่ม text / translation | `i18n/locales/th.json` + `en.json` |
| เปลี่ยน config | `nuxt.config.ts` |
| ดู type definitions | `app/types/` |
| Auth flow | `app/middleware/auth.global.ts` + `server/routes/auth/google.get.ts` |
| Excel processing | `server/utils/excelStream*.ts` + `server/utils/chunkProcessor.ts` |
