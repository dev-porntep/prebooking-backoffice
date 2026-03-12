# Upload Pattern Comparison: BFF-Proxy vs Presigned S3 URL

> เอกสารนี้เปรียบเทียบ 2 pattern สำหรับ Excel file upload ไปยัง S3
> เพื่อใช้ประกอบการตัดสินใจ architecture

---

## Pattern A — BFF-Proxy (pattern ที่เลือกใช้ในโปรเจกต์นี้)

Client ส่งไฟล์ไปยัง BFF ก่อน จากนั้น BFF proxy ต่อไปยัง Backend ซึ่ง Backend เป็นคนบันทึกลง S3

```
Browser                     BFF (Nitro)                    Backend              S3
   │                             │                             │                  │
   │  POST /api/settings/        │                             │                  │
   │  upload/quota               │                             │                  │
   │  (multipart FormData)       │                             │                  │
   ├────────────────────────────►│                             │                  │
   │                             │  validate file              │                  │
   │                             │  (size, extension)          │                  │
   │                             │                             │                  │
   │                             │  POST /settings/upload/     │                  │
   │                             │  quota                      │                  │
   │                             │  (binary body + auth token) │                  │
   │                             ├────────────────────────────►│                  │
   │                             │                             │  PutObject       │
   │                             │                             ├─────────────────►│
   │                             │                             │◄─────────────────┤
   │                             │◄────────────────────────────┤                  │
   │                             │  { success, filename,       │                  │
   │                             │    uploadedAt }             │                  │
   │◄────────────────────────────┤                             │                  │
   │  200 OK                     │                             │                  │
```

### Code ที่เกี่ยวข้อง

```
Browser
  ExcelUploadSection.vue
    └─► useSettingsUpload(uploadApiPath)          [app/composables/useSettingsUpload.ts]
          └─► $fetch(POST FormData)
                └─► BFF: /api/settings/upload/[type]   [server/api/settings/upload/[type].post.ts]
                      │  readMultipartFormData
                      │  validate (size ≤ 50 MB, .xlsx/.xls)
                      └─► backendFetch(event, path, { body: buffer, headers })
                            └─► Backend API → S3
```

---

## Pattern B — Presigned S3 URL

Client ขอ URL พิเศษจาก BFF ก่อน จากนั้นอัปโหลดตรงไปยัง S3 โดยไม่ผ่าน BFF

```
Browser                     BFF (Nitro)                    Backend              S3
   │                             │                             │                  │
   │  Step 1: ขอ Presigned URL   │                             │                  │
   │  POST /api/settings/        │                             │                  │
   │  presign/quota              │                             │                  │
   │  { filename, contentType }  │                             │                  │
   ├────────────────────────────►│                             │                  │
   │                             │  POST /settings/presign/    │                  │
   │                             │  quota                      │                  │
   │                             ├────────────────────────────►│                  │
   │                             │                             │  getSignedUrl()  │
   │                             │                             ├─────────────────►│
   │                             │                             │◄─────────────────┤
   │                             │                             │  presignedUrl    │
   │                             │◄────────────────────────────┤  (มีอายุ 5 นาที) │
   │◄────────────────────────────┤                             │                  │
   │  { presignedUrl, fileKey }  │                             │                  │
   │                             │                             │                  │
   │  Step 2: อัปโหลดตรงไป S3   │                             │                  │
   │  PUT {presignedUrl}         │                             │                  │
   │  (binary body)              │                             │                  │
   ├─────────────────────────────────────────────────────────────────────────────►│
   │◄─────────────────────────────────────────────────────────────────────────────┤
   │  200 OK                     │                             │                  │
   │                             │                             │                  │
   │  Step 3: แจ้ง BFF ว่าอัปโหลดสำเร็จ                       │                  │
   │  POST /api/settings/        │                             │                  │
   │  confirm/quota              │                             │                  │
   │  { fileKey }                │                             │                  │
   ├────────────────────────────►│                             │                  │
   │                             │  POST /settings/confirm/    │                  │
   │                             │  quota                      │                  │
   │                             ├────────────────────────────►│                  │
   │◄────────────────────────────┤◄────────────────────────────┤                  │
   │  { success }                │                             │                  │
```

### Code ที่ต้องเพิ่ม (ถ้าใช้ pattern นี้)

```
Browser
  ExcelUploadSection.vue
    └─► useSettingsUpload(presignApiPath, confirmApiPath)
          │
          │  Step 1: ขอ URL
          ├─► $fetch(POST /api/settings/presign/quota, { filename, contentType })
          │     └─► BFF presign route → Backend → S3 SDK → presignedUrl
          │
          │  Step 2: อัปโหลดตรงไป S3
          ├─► fetch(PUT presignedUrl, { body: file })   ← ไม่ผ่าน BFF เลย
          │
          │  Step 3: ยืนยัน
          └─► $fetch(POST /api/settings/confirm/quota, { fileKey })
                └─► BFF confirm route → Backend บันทึก metadata
```

---

## เปรียบเทียบ

| มิติ | BFF-Proxy (A) | Presigned URL (B) |
|------|:---:|:---:|
| **ขั้นตอน (round-trips)** | 1 ครั้ง | 3 ครั้ง |
| **Bandwidth ที่ BFF รับ** | ทุก byte ผ่าน BFF | 0 byte (ข้าม BFF ไปเลย) |
| **Bandwidth ที่ Backend รับ** | ทุก byte | 0 byte (S3 รับตรง) |
| **Auth token รั่วไป client** | ❌ ไม่รั่ว | ❌ ไม่รั่ว (presignedUrl ไม่ใช่ token) |
| **S3 CORS config** | ไม่ต้องการ | **ต้องการ** (browser PUT ตรง) |
| **Backend endpoint ใหม่** | 1 (upload) | 2 (presign + confirm) |
| **Logging ทุก request** | ✅ ผ่าน HttpClientBase เสมอ | ⚠️ leg S3 มองไม่เห็นจาก BFF |
| **Retry logic** | ✅ HttpClientBase retry อัตโนมัติ | ❌ client ต้อง retry เอง |
| **ไฟล์ขนาด 50 MB** | ✅ พอใช้ได้ | ✅ ดีกว่า (ไม่ใช้ memory BFF) |
| **ไฟล์ขนาด 500 MB+** | ⚠️ BFF อาจ timeout/OOM | ✅ เหมาะมาก |
| **ความซับซ้อนของ code** | ต่ำ | สูง (3 states, error handling 3 จุด) |
| **ความซับซ้อนของ infra** | ต่ำ | สูง (S3 CORS, presign TTL, fileKey tracking) |

---

## เมื่อไหร่ควรใช้ Pattern ใด

### ใช้ BFF-Proxy เมื่อ

- ไฟล์ขนาด **ไม่เกิน ~100 MB**
- ต้องการ **audit log** ครบทุก request (compliance, security)
- ทีมมีขนาด **เล็ก-กลาง** ต้องการ code ที่ maintain ง่าย
- **Backend ยังไม่มี** presign endpoint (กรณีโปรเจกต์นี้ — backend ยังเป็น mock)
- ต้องการใช้ retry/timeout logic เดิมของ HttpClientBase ต่อทันที

### ใช้ Presigned URL เมื่อ

- ไฟล์ขนาด **ใหญ่มาก (100 MB+)** และ BFF server มี memory/bandwidth จำกัด
- มี **CDN หรือ multi-region** ต้องการให้ client upload ไปยัง region ที่ใกล้ที่สุด
- ต้องการ **multipart upload** แบบ resumable (หยุดแล้วอัปโหลดต่อได้)
- Backend/infra ทีมพร้อม และมี S3 CORS config อยู่แล้ว

---

## สรุปสำหรับโปรเจกต์นี้

โปรเจกต์นี้เลือก **Pattern A (BFF-Proxy)** เพราะ:

1. ไฟล์ Excel สูงสุด 50 MB — BFF รับได้สบาย (routeRules `x-max-body-size: 50mb` ตั้งไว้แล้ว)
2. Backend ยังเป็น mock — ยังไม่มี presign endpoint ให้เรียก
3. Code ง่ายกว่า 3 เท่า (1 endpoint แทน 3 endpoints)
4. ใช้ `HttpClientBase` logging + retry ได้เลยโดยไม่ต้องเพิ่ม logic ใหม่

> ถ้าในอนาคตต้องรองรับไฟล์ > 100 MB หรือมี CDN multi-region
> ให้ migrate ไป Pattern B โดยเพิ่ม `/api/settings/presign/[type]` และ `/api/settings/confirm/[type]`
> แล้วเปลี่ยนแค่ `useSettingsUpload.ts` — component ไม่ต้องแตะเลย
