# SSO Setup Guide — Prebooking Backoffice

คู่มือนี้อธิบายวิธีเชื่อมต่อ **SSO จริง (ฟรี)** เพื่อทดสอบระบบ login ของ Prebooking Backoffice

ระบบปัจจุบัน auth ถูก mock ไว้ทั้งหมด (`isAuthenticated = true`) guide นี้จะแนะนำวิธีปลด mock และต่อ SSO จริงใน 2 ตัวเลือก

---

## Prerequisites

- Node.js 22+
- `nuxt-auth-utils` v0.5.29 — ติดตั้งอยู่แล้ว ไม่ต้อง install เพิ่ม
- Docker — ต้องการเฉพาะ Option B (Keycloak)
- `NUXT_SESSION_PASSWORD` ต้องเป็น random string อย่างน้อย 32 ตัวอักษร

สร้าง session password:

```bash
openssl rand -base64 32
```

---

## ภาพรวม: Auth Flow

```
Browser → /auth/google (หรือ /auth/keycloak)
        → OAuth/OIDC Provider (Google / Keycloak)
        → callback → setUserSession → เซ็ต cookie

Browser → เปิดหน้าไหนก็ได้
        → auth.global.ts อ่าน useUserSession().loggedIn
        → ถ้าไม่ login → redirect /login

Browser → เรียก /api/prebooking, /api/import, /api/export
        → server/middleware/auth.ts อ่าน getUserSession(event)
        → ถ้าไม่มี session → 401 Unauthorized
```

---

## Option A: Google OAuth (แนะนำสำหรับทดสอบ)

**เหมาะกับ:** ทดสอบเร็ว ไม่ต้องรัน server เพิ่ม ใช้ Google account ที่มีอยู่แล้ว

### A1 — สร้าง Google OAuth Credentials

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. สร้าง project ใหม่หรือเลือก project ที่มีอยู่
3. ไปที่ **APIs & Services** → **Credentials**
4. คลิก **+ Create Credentials** → **OAuth client ID**
5. กด **Configure Consent Screen** (ถ้ายังไม่ได้ตั้ง):
   - User Type: **External**
   - กรอก App name, email
   - เพิ่ม scope: `email`, `profile`, `openid`
   - เพิ่ม email ตัวเองเป็น Test user
6. กลับมาสร้าง OAuth client:
   - Application type: **Web application**
   - Name: `Prebooking Backoffice Dev`
   - Authorized redirect URIs: `http://localhost:3000/auth/google`
7. Copy **Client ID** และ **Client Secret**

### A2 — ตั้งค่า Environment Variables

สร้างหรือแก้ไขไฟล์ `.env` ที่ root ของ project:

```dotenv
# Google OAuth
NUXT_OAUTH_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here

# Session (ต้องมี, >= 32 chars)
NUXT_SESSION_PASSWORD=paste-output-of-openssl-rand-base64-32-here

# Backend (ค่าเดิม)
BACKEND_API_URL=http://localhost:8080/api/v1
```

> `nuxt-auth-utils` อ่านค่า `NUXT_OAUTH_GOOGLE_*` โดยอัตโนมัติ ไม่ต้อง config เพิ่มใน `nuxt.config.ts`

### A3 — สร้าง OAuth Route Handler

สร้างไฟล์ใหม่: `server/routes/auth/google.get.ts`

```typescript
export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['openid', 'email', 'profile'],
  },
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, {
      user: {
        id: user.sub,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: 'admin', // TODO: ปรับตาม role จริงจาก backend
      },
      accessToken: tokens.access_token,
    })
    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/login?error=oauth_failed')
  },
})
```

### A4 — แก้ Login Page

แก้ไข `app/pages/login.vue` — เปลี่ยน target ของปุ่ม SSO:

```typescript
// บรรทัดที่ handleSSOLogin ใน <script setup>

// เดิม
await navigateTo('/api/auth/sso', { external: true })

// เปลี่ยนเป็น
await navigateTo('/auth/google', { external: true })
```

---

## Option B: Keycloak with Docker (ตรงกับ production config)

**เหมาะกับ:** ทดสอบ flow ที่ใกล้เคียง production มากที่สุด รองรับ OIDC เต็มรูปแบบ และ Role-based access

### B1 — Start Keycloak Container

```bash
docker run -d \
  --name keycloak-dev \
  -p 9090:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:24.0.3 \
  start-dev
```

> ใช้ port **9090** (map ไป 8080 ใน container) เพราะ port 8080 อาจชนกับ `BACKEND_API_URL`

รอประมาณ 30 วินาที แล้วเปิด [http://localhost:9090](http://localhost:9090)

### B2 — ตั้งค่า Keycloak Admin

1. **Login**: ใช้ `admin` / `admin`

2. **สร้าง Realm ใหม่**:
   - คลิก dropdown มุมบนซ้าย (ปัจจุบันแสดง `Keycloak`) → **Create realm**
   - Realm name: `prebooking-dev`
   - คลิก **Create**

3. **สร้าง Client**:
   - ไปที่ **Clients** → **Create client**
   - Client ID: `prebooking-backoffice`
   - Client type: `OpenID Connect`
   - คลิก **Next**
   - **Client authentication**: เปิด ON (confidential)
   - **Authentication flow**: เลือก `Standard flow`
   - คลิก **Next**
   - Valid redirect URIs: `http://localhost:3000/auth/keycloak`
   - Web origins: `http://localhost:3000`
   - คลิก **Save**

4. **Copy Client Secret**:
   - ไปที่ tab **Credentials**
   - Copy ค่า `Client secret`

5. **สร้าง Test User**:
   - ไปที่ **Users** → **Add user**
   - Username: `testuser`
   - Email: `test@example.com`
   - คลิก **Create**
   - ไปที่ tab **Credentials** → **Set password**
   - ตั้ง password, ปิด `Temporary` → **Save**

### B3 — ตั้งค่า Environment Variables

สร้างหรือแก้ไขไฟล์ `.env`:

```dotenv
# Keycloak OIDC
NUXT_OIDC_KEYCLOAK_CLIENT_ID=prebooking-backoffice
NUXT_OIDC_KEYCLOAK_CLIENT_SECRET=paste-secret-from-keycloak-credentials-tab
NUXT_OIDC_KEYCLOAK_ISSUER=http://localhost:9090/realms/prebooking-dev

# Session (ต้องมี, >= 32 chars)
NUXT_SESSION_PASSWORD=paste-output-of-openssl-rand-base64-32-here

# Backend (ใช้ port อื่นถ้า 8080 ชนกับ Keycloak container)
BACKEND_API_URL=http://localhost:8081/api/v1
```

### B4 — สร้าง OIDC Route Handler

สร้างไฟล์ใหม่: `server/routes/auth/keycloak.get.ts`

```typescript
export default defineOIDCEventHandler({
  config: {
    issuer: process.env.NUXT_OIDC_KEYCLOAK_ISSUER!,
    clientId: process.env.NUXT_OIDC_KEYCLOAK_CLIENT_ID!,
    clientSecret: process.env.NUXT_OIDC_KEYCLOAK_CLIENT_SECRET!,
    redirectURL: 'http://localhost:3000/auth/keycloak',
    scope: ['openid', 'email', 'profile'],
  },
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, {
      user: {
        id: user.sub,
        name: (user.name as string) ?? (user.preferred_username as string),
        email: user.email as string,
        role: (user.realm_access as { roles: string[] })?.roles?.includes('admin')
          ? 'admin'
          : 'viewer',
      },
      accessToken: tokens.access_token,
    })
    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('Keycloak OIDC error:', error)
    return sendRedirect(event, '/login?error=oidc_failed')
  },
})
```

### B5 — แก้ Login Page

แก้ไข `app/pages/login.vue`:

```typescript
// เดิม
await navigateTo('/api/auth/sso', { external: true })

// เปลี่ยนเป็น
await navigateTo('/auth/keycloak', { external: true })
```

---

## ขั้นตอนที่ 3: ปลด Mock Auth Layer (ทำสำหรับทั้งสอง Option)

หลังเลือก option และตั้งค่าเสร็จแล้ว ให้แก้ไฟล์ต่อไปนี้:

### แก้ไข `app/middleware/auth.global.ts`

```typescript
// เดิม (mock)
export default defineNuxtRouteMiddleware((to) => {
  // TODO: เปลี่ยนเป็น useUserSession() ตอนต่อ SSO จริง
  const isAuthenticated = true // mock

  if (to.path === '/login') return

  if (!isAuthenticated) {
    return navigateTo('/login')
  }
})

// เปลี่ยนเป็น (real)
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  if (to.path === '/login') return

  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
```

### แก้ไข `server/middleware/auth.ts`

```typescript
// เดิม (mock)
export default defineEventHandler(async (event) => {
  const protectedPaths = ['/api/prebooking', '/api/import', '/api/export']
  const url = getRequestURL(event)

  if (!protectedPaths.some(path => url.pathname.startsWith(path))) return

  // TODO: เปลี่ยนเป็น getUserSession(event) ตอนต่อ SSO จริง
  const session = { user: { id: '1', name: 'Admin' }, accessToken: 'mock-token' }

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  event.context.auth = {
    user: session.user,
    token: session.accessToken,
  }
})

// เปลี่ยนเป็น (real)
export default defineEventHandler(async (event) => {
  const protectedPaths = ['/api/prebooking', '/api/import', '/api/export']
  const url = getRequestURL(event)

  if (!protectedPaths.some(path => url.pathname.startsWith(path))) return

  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  event.context.auth = {
    user: session.user,
    token: session.accessToken as string | undefined,
  }
})
```

### แก้ไข `server/api/auth/sso.get.ts`

เปลี่ยนเป็น redirect ไปยัง provider ที่เลือก (หรือลบไฟล์นี้ทิ้งได้):

```typescript
// Option A (Google)
export default defineEventHandler(event =>
  sendRedirect(event, '/auth/google')
)

// Option B (Keycloak)
export default defineEventHandler(event =>
  sendRedirect(event, '/auth/keycloak')
)
```

### `server/api/auth/callback.get.ts`

ไฟล์นี้ไม่ได้ใช้แล้ว เพราะ `nuxt-auth-utils` จัดการ callback ที่ route handler โดยตรง
ลบไฟล์นี้ทิ้ง หรือเปลี่ยนเป็น:

```typescript
export default defineEventHandler(() => {
  throw createError({ statusCode: 410, message: 'Gone. Auth callback moved to /auth/google or /auth/keycloak.' })
})
```

### สร้างไฟล์ Logout: `server/routes/auth/logout.get.ts`

```typescript
export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  return sendRedirect(event, '/login')
})
```

---

## ทดสอบ End-to-End

1. รัน dev server:
   ```bash
   npm run dev
   ```

2. เปิด [http://localhost:3000](http://localhost:3000) → ควร redirect ไป `/login` ✓

3. คลิกปุ่ม SSO → ควร redirect ไป Google / Keycloak ✓

4. Login สำเร็จ → กลับมาที่ `/` (dashboard) ✓

5. ตรวจสอบ session cookie:
   - DevTools → Application → Cookies → `localhost`
   - ควรมี cookie ชื่อ `nuxt-session` (HttpOnly) ✓

6. ทดสอบ API protection:
   ```bash
   curl http://localhost:3000/api/prebooking
   # ควรได้ 401 Unauthorized
   ```

7. ทดสอบ logout:
   - เปิด [http://localhost:3000/auth/logout](http://localhost:3000/auth/logout)
   - ควร redirect ไป `/login` และ session cookie หายไป ✓

8. ตรวจสอบ quality:
   ```bash
   npm run quality
   # typecheck + lint ต้อง pass
   ```

---

## Troubleshooting

| อาการ | สาเหตุ | วิธีแก้ |
|-------|--------|---------|
| `redirect_uri_mismatch` (Google) | Redirect URI ใน Google Console ไม่ตรง | เพิ่ม `http://localhost:3000/auth/google` ใน Authorized redirect URIs |
| `Invalid redirect_uri` (Keycloak) | Redirect URI ใน Keycloak client ไม่ตรง | เพิ่ม `http://localhost:3000/auth/keycloak` ใน Valid redirect URIs |
| Cookie ไม่ถูก set หลัง callback | `NUXT_SESSION_PASSWORD` ขาดหรือสั้นกว่า 32 chars | Generate ด้วย `openssl rand -base64 32` |
| 401 ทุก API call แม้ login แล้ว | `server/middleware/auth.ts` ยังใช้ mock | ตรวจสอบว่าแก้ไขเป็น `getUserSession(event)` แล้ว |
| Redirect loop ที่ `/login` | `auth.global.ts` ยังมี `isAuthenticated = true` | ตรวจสอบว่าแก้ไขเป็น `useUserSession()` แล้ว |
| Port 9090 ใช้ไม่ได้ (Keycloak) | Port ถูกใช้งานอยู่แล้ว | เปลี่ยน docker run เป็น `-p 9191:8080` และอัปเดต `NUXT_OIDC_KEYCLOAK_ISSUER` |
| Keycloak `HTTPS required` error | Keycloak บาง version บังคับ HTTPS | ใช้ `start-dev` flag (ดูคำสั่งด้านบน) — mode นี้ปิด HTTPS requirement |
| `consent_required` (Google) | App ยังอยู่ในโหมด testing | เพิ่ม email ของตัวเองใน Google Console → OAuth consent screen → Test users |

---

## หมายเหตุสำหรับ Production

- เปลี่ยน `process.env.*` ใน Keycloak handler เป็น `useRuntimeConfig().sso.*`
  (ซึ่ง map กับ env vars อยู่แล้วใน `nuxt.config.ts`)
- เปลี่ยน `redirectURL` จาก `http://localhost:3000` เป็น domain จริง
- ตั้ง `NUXT_SESSION_PASSWORD` ใน secret manager ไม่ใช่ plain `.env`
- Keycloak production ควรใช้ `start` (ไม่ใช่ `start-dev`) พร้อม TLS
