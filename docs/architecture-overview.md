# Architecture Overview — Prebooking Backoffice

> เอกสารสำหรับประชุม dev เพื่อทำความเข้าใจโครงสร้างระบบ
> อัปเดตล่าสุด: 12 มีนาคม 2026 (rev 3 — ลบ Import/Export pages ออกจากระบบ)

---

## 1. ภาพรวมระบบ

**Prebooking Backoffice** คือ internal admin tool สำหรับทีม ops จัดการ pre-order อุปกรณ์มือถือ ฟีเจอร์หลัก:

- ดู Dashboard stats และรายการ prebooking ทั้งหมด
- อัปโหลด Excel สำหรับตั้งค่า Quota และ Pickup Date ผ่านหน้า Settings

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
│   │   └── settings.vue          ← Settings (quota & pickup date upload)
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
│   │   └── prebookingStore.ts    ← State: รายการ + stats + pagination + filters
│   │
│   ├── composables/              ← Business logic wrappers
│   │   ├── usePrebooking.ts      ← Expose store refs + helpers
│   │   ├── useSettingsUpload.ts  ← Upload Excel สำหรับ quota/pickup date (Settings page)
│   │   └── useAuth.ts            ← Session check, login/logout
│   │
│   ├── middleware/
│   │   └── auth.global.ts        ← Client route guard (redirect ถ้าไม่ login)
│   │
│   ├── types/
│   │   ├── prebooking.ts         ← Prebooking, PrebookingFilter, PrebookingStats
│   │   ├── settings.ts           ← Settings upload types
│   │   └── auth.ts               ← SSOUser, UserRole, AuthSession
│   │
│   └── utils/
│       └── cn.ts                 ← clsx + tailwind-merge helper
│
├── server/
│   ├── api/                      ← Nitro API routes (auto-mapped)
│   │   ├── prebooking/           ← GET (list) / POST (create)
│   │   ├── settings/             ← upload/[type].post
│   │   └── auth/                 ← sso.get, callback.get
│   │
│   ├── middleware/
│   │   └── auth.ts               ← Server route guard (401 ถ้าไม่มี session)
│   │
│   └── utils/
│       └── backendProxy.ts       ← Wrapper สำหรับเรียก external backend API
│
├── i18n/locales/
│   ├── th.json                   ← Thai (default)
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
│    helper methods (refresh, delete...)                       │
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

### 5.2 Settings Upload Pattern (BFF-proxy)

Upload flow สำหรับ Settings page (quota/pickup date):

```
Component
  └─► useSettingsUpload(uploadApiPath)
        └─► $fetch(POST FormData)
              └─► BFF: /api/settings/upload/[type]
                    │  readMultipartFormData → validate → backendFetch
                    └─► Backend → S3
```

**ทำไมถึงใช้ BFF-proxy แทน Presigned S3 URL:**
- ไฟล์ไม่เกิน 50 MB — BFF proxy รับได้สบาย
- Token/auth อยู่ server-side ทั้งหมด (ไม่รั่วไป client)
- ใช้ `HttpClientBase` logging + retry chain เดิมได้เลย
- Presigned URL ต้องการ: backend endpoint ใหม่ + S3 CORS config + client multipart — ซับซ้อนเกินความจำเป็น

> **Note (pending backend):** `backendFetch` ต้องส่ง Content-Type ที่ถูกต้องเมื่อ proxy binary — `backendProxy.ts` รองรับ `options.headers` override แล้ว ต้องยืนยันกับ backend ว่ารับ raw binary body หรือ `multipart/form-data`

---

### 5.3 i18n-First Pattern

ทุก text ในหน้า UI ต้องผ่าน translation key เสมอ

```typescript
// เพิ่ม key ใน i18n/locales/th.json และ en.json ก่อน
{ "settings": { "quota": { "title": "Update Quota" } } }

// ใน template
{{ $t('settings.quota.title') }}
```

Structure ของ locale keys:
- `app.*` — ชื่อแอป
- `nav.*` — เมนู navigation
- `pages.*` — ชื่อหน้า
- `home.*` — Dashboard
- `settings.*` — Settings page
- `toast.*` — Notification messages
- `status.*` — Prebooking status labels

---

## 6. Pages & Routing

ทุก route ต้อง login — ไม่มีหน้า public

| Route | File | Layout |
|-------|------|--------|
| `/` | `pages/index.vue` | default |
| `/display` | `pages/display.vue` | default |
| `/settings` | `pages/settings.vue` | default |

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
ถ้าเรียก `/api/prebooking`, `/api/settings` โดยไม่มี session → HTTP 401

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
| UX ดี | Responsive layout, toast notifications, real-time state |
| UI ยืดหยุ่น | Reka UI headless → ปรับ style ได้ทุกอย่างโดยไม่ override |
| Dev velocity | Mock data → frontend dev ได้ทันทีโดยไม่รอ backend |
| i18n พร้อม | เพิ่มภาษาใหม่ได้ง่าย — แค่เพิ่ม locale file |
| Auto-import | Pages, stores, composables, components — ไม่ต้อง import มือ |

### ข้อเสีย / ข้อควรระวัง

| ข้อเสีย | ผลกระทบ | วิธีแก้ |
|--------|--------|--------|
| **Mock API ทั้งหมด** | ยังใช้งานจริงไม่ได้ | ต่อ backendFetch() เมื่อ backend พร้อม |
| **ไม่มี test framework** | ไม่มี test coverage | เพิ่ม Vitest + Playwright (unit tests ใน `tests/unit/`, E2E tests ใน `tests/e2e/`) |
| **Nuxt 4 ใหม่มาก** | Community resource น้อยกว่า v3 | ดู official docs + migration guide |
| **SSO direct redirect** | ถ้า OAuth error จะ loop กลับ Google | error ปัจจุบัน retry /auth/google |

---

## 11. Roadmap (สิ่งที่ยังต้องทำก่อน Go-Live)

### Done ✅
- [x] Google SSO direct flow (ไม่มีหน้า login)
- [x] Font ใช้ Vite asset pipeline (รองรับ base URL ทุก deployment)
- [x] Vercel deployment workflow (`.github/workflows/deploy-vercel.yml`)
- [x] `.env.example` ด้วย env vars ที่ถูกต้อง
- [x] Settings page: upload quota / pickup date ผ่าน BFF-proxy

### Pending
- [ ] **ต่อ backend API จริง** — เริ่มจาก endpoints สำคัญ: `/api/prebooking`, `/api/settings/upload` (แทน mock responses ด้วย `backendFetch()`)
- [ ] **Test framework** — เพิ่ม Vitest (unit) + Playwright (E2E)
- [ ] **Error monitoring** — เพิ่ม Sentry หรือ equivalent
- [ ] **Rate limiting** — เพิ่มบน `/api/settings/upload`
- [ ] **OAuth error page** — แสดง error message แทน retry loop เมื่อ Google OAuth fail
      - ควร redirect ไปหน้า `/auth/error` เมื่อเกิด OAuth error
      - หน้า error ควรแสดงข้อความที่ user-friendly, มีปุ่ม retry และ support contact
      - ใช้ layout เดียวกับ default, แต่เน้น error state (icon + สีแดง)

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
| Settings upload | `app/composables/useSettingsUpload.ts` + `server/api/settings/` |
