# Prebooking Back Office

ระบบจัดการข้อมูล Prebooking สำหรับ Back Office — สร้างด้วย Nuxt 4

---

## Quick Start

### รันด้วย Node (Local)

```bash
# ติดตั้ง dependencies
npm install

# คัดลอกและแก้ไข environment variables
cp .env.example .env

# รัน dev server
npm run dev          # http://localhost:3000
npm run dev:log      # dev + pino-pretty (human-readable logs)
```

### รันด้วย Docker

```bash
# Development — hot reload (source bind-mounted)
docker compose up

# Production simulation — ต้องมี .env ที่มี secrets ครบ
docker compose -f docker-compose.prod.yml up

# Build production image แบบ manual
DOCKER_BUILDKIT=1 docker build --target runtime -t prebooking-backoffice .
docker run -p 3000:3000 --env-file .env prebooking-backoffice
```

> ดู [.env.example](.env.example) สำหรับตัวแปรที่จำเป็น

---

## Commands

| Command | คำอธิบาย |
|---------|----------|
| `npm run dev` | รัน dev server |
| `npm run dev:log` | รัน dev server + แสดง log แบบ pino-pretty |
| `npm run build` | Build สำหรับ production |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run typecheck` | TypeScript check |
| `npm run quality` | typecheck + lint (รันก่อน commit) |

---

## Environment Variables

คัดลอก `.env.example` เป็น `.env` แล้วกรอกค่าต่าง ๆ

| Variable | ค่า default | คำอธิบาย |
|----------|-------------|----------|
| `BACKEND_API_URL` | `http://localhost:8080` | Backend base URL |
| `NUXT_SESSION_PASSWORD` | — | Session password ≥ 32 chars |
| `NUXT_OAUTH_GOOGLE_CLIENT_ID` | — | Google OAuth client ID |
| `NUXT_OAUTH_GOOGLE_CLIENT_SECRET` | — | Google OAuth client secret |
| `NUXT_PUBLIC_AUTH_ENABLED` | `true` | ปิดได้สำหรับ static preview |
| `LOG_PATH` | `logs/app` | Path สำหรับไฟล์ log (ไม่ต้องใส่ `.log`) |
| `LOG_TO_FILE` | `false` | `true` = เขียนไฟล์ด้วย, `false` = stdout เท่านั้น |
| `LOG_LEVEL` | `info` | `trace` / `debug` / `info` / `warn` / `error` |
| `LOG_CHANNEL` | `prebooking-backoffice` | Label ใน JSON log |
| `LOG_PRODUCT` | `backoffice` | Product label ใน JSON log |
| `LOG_SERVICE_NAME` | `prebooking-backoffice` | Service name ใน JSON log |

---

## Architecture

Nuxt 4 — source root อยู่ที่ `app/` (ไม่ใช่ project root)

```
app/
├── components/       # UI components
├── composables/      # Composable functions
├── layouts/          # Page layouts (default, auth)
├── middleware/       # Route middleware (auth.global.ts)
├── pages/            # Pages / routes
└── stores/           # Pinia stores

server/
├── api/              # Nitro API routes (BFF layer)
│   ├── auth/
│   ├── export/
│   ├── import/
│   ├── logs/         # Log viewer API
│   ├── prebooking/
│   └── templates/
├── helpers/          # Server helpers (step-name-map)
├── plugins/          # Nitro plugins (http-logger)
├── services/         # HttpClientBase (axios + retry)
└── utils/            # Server utilities

i18n/
└── locales/
    ├── th.json       # Thai (default)
    └── en.json       # English
```

### Request Flow

```
Pages → Composables → Pinia Stores → Nitro API Routes (/api/...)
                                          └── backendProxy → Backend API
```

Nitro plugin `http-logger` intercepts ทุก request ใน `/api/*` โดยอัตโนมัติ

---

## Features

### Import Excel
- **Quota สินค้า** — นำเข้า Quota ตาม Mat Code/SKU แยก Normal/Special
- **ตารางวันจอง-รับ** — Mapping วันจอง Prebooking → วันรับสินค้า
- **ช่วงเวลารับสินค้า** — Time Slots สำหรับการรับเครื่อง

ขีดจำกัด: ไฟล์ .xlsx/.xls เท่านั้น, สูงสุด 50 MB / 100,000 แถว, ประมวลผลทีละ 500 แถว

### Export Excel
- Export ข้อมูล Prebooking ทั้งหมดเป็น `.xlsx` หรือ `.csv`

### Server Logs (Log Viewer)
Built-in log viewer ที่ `/logs` — ดู request/response log ของ server ผ่าน UI

**เปิดใช้งาน:**
```bash
# ใน .env
LOG_TO_FILE=true
LOG_PATH=logs/app
```

**Features:**
| Feature | คำอธิบาย |
|---------|----------|
| File selector | เลือกดู log file ได้ตาม วัน/ชั่วโมง (hourly rotation) |
| Level filter | กรองตาม ALL / INFO / WARN / ERROR / DEBUG |
| Search | ค้นหาด้วย endpoint, txid, step name, หรือ message |
| Table view | แสดง time, level badge, method, endpoint, status code (สีตามค่า), elapsed ms |
| Error highlight | แถว ERROR มี background แดงอ่อน |
| Detail panel | คลิกแถวแล้วเปิด slideover แสดง request / response / raw JSON แบบ pretty-print |
| Pagination | 50 entries ต่อหน้า, เรียงล่าสุดก่อน |

**ดู log ใน terminal (dev):**
```bash
npm run dev:log
```

**Log format (NDJSON — 1 line = 1 JSON object):**
```json
{
  "level": "INFO",
  "time": "2026-03-11T08:18:05.761Z",
  "txid": "1c36a601-...",
  "endpoint": "/api/prebooking",
  "method": "GET",
  "result_code": "200",
  "elapsed_time": 6,
  "step_request": "...",
  "step_response": "...",
  "msg": "STEP: Internal API: Request completed with status 200"
}
```

---

## Logging Infrastructure

### col-log.utils (`server/utils/col-log.utils.ts`)

Structured logging factory based on [Pino](https://getpino.io/)

```ts
const log = createLogModel({ txid: 'abc-123', service_type: 'my-service' })

log.logIn('Incoming request', { endpoint: '/api/foo', method: 'GET' })
log.logStep('Calling backend', { activity_name: 'callBackend', endpoint: '/users' })
log.logOut('Request complete', { result_code: '200' })
log.logError('Request failed', { error: err })
```

### HttpClientBase (`server/services/http-client-base.ts`)

Axios-based HTTP client พร้อม:
- **Auto retry** — 3 ครั้ง, exponential backoff (1s → 2s → 4s) สำหรับ status 408, 500, 502, 503, 504
- **Request/Response interceptors** — log ทุก outbound call อัตโนมัติ
- **Authorization masking** — ซ่อน header ใน log

```ts
const client = new HttpClientBase('https://api.example.com')
const res = await client.get<User[]>('/users', { headers: { 'x-correlator-id': txid } })
```

### http-logger plugin (`server/plugins/http-logger.ts`)

Nitro plugin ที่ log ทุก `/api/*` request/response อัตโนมัติ:
- `request` hook → บันทึก txid, stamp start time
- `afterResponse` hook → log status + elapsed time, mask sensitive headers

---

## Docker

### ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | คำอธิบาย |
|------|----------|
| `Dockerfile` | Multi-stage build: `deps` → `build` → `runtime` (~150-200 MB) |
| `.dockerignore` | Exclude `node_modules`, `.output`, `.nuxt`, secrets ออกจาก build context |
| `docker-compose.yml` | Development — hot reload ด้วย bind mount |
| `docker-compose.prod.yml` | Production simulation บน local |
| `buildspec.yml` | AWS CodeBuild — build และ push image ไป ECR |

### Docker Build Stages

```
deps     → npm ci (ติดตั้ง packages ทั้งหมด)
build    → npm run build (compile → .output/)
runtime  → node:22-alpine + .output/ เท่านั้น (ไม่มี node_modules)
```

Nitro server output (`.output/`) เป็น self-contained — ไม่ต้องการ `node_modules` ที่ runtime

### Environment variables ใน Docker

ตัวแปรเดียวกับ local แต่ต้องตั้ง:

```env
LOG_TO_FILE=false    # ใช้ stdout เสมอใน Docker
HOST=0.0.0.0         # Bind ทุก interface
```

### AWS CodeBuild (buildspec.yml)

ต้องตั้ง environment variables ใน CodeBuild project console:

| Variable | ตัวอย่าง |
|----------|---------|
| `AWS_ACCOUNT_ID` | `123456789012` |
| `AWS_DEFAULT_REGION` | `ap-southeast-1` |
| `ECR_REPO_NAME` | `prebooking-backoffice` |

CodeBuild service role ต้องมีสิทธิ์ push ไป ECR (`ecr:PutImage`, `ecr:InitiateLayerUpload`, ฯลฯ)

Image จะถูก tag ด้วย `$CODEBUILD_BUILD_NUMBER` และ `latest` พร้อม output `imagedefinitions.json` สำหรับ ECS deploy

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Nuxt 4 (Vue 3, TypeScript) |
| UI | Tailwind CSS v4, @nuxt/icon (Lucide) |
| State | Pinia |
| Auth | nuxt-auth-utils (Google OAuth) |
| i18n | @nuxtjs/i18n (Thai / English) |
| Logging | Pino + pino-roll (hourly rotation) |
| HTTP Client | Axios + axios-retry |
| Excel | ExcelJS (server), xlsx/SheetJS (client) |
| Validation | vee-validate + Zod |
| Container | Docker (node:22-alpine, multi-stage) |
| CI/CD | AWS CodeBuild + ECR |
