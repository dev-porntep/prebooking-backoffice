import type { SettingsUploadResponse } from '~/types/settings'

const ALLOWED_TYPES = ['quota', 'dates'] as const
type UploadType = (typeof ALLOWED_TYPES)[number]

function isAllowedType(value: string | undefined): value is UploadType {
  return ALLOWED_TYPES.includes(value as UploadType)
}

export default defineEventHandler(async (event): Promise<SettingsUploadResponse> => {
  const type = getRouterParam(event, 'type')

  if (!isAllowedType(type)) {
    throw createError({ statusCode: 400, message: `Invalid upload type. Allowed: ${ALLOWED_TYPES.join(', ')}` })
  }

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(p => p.name === 'file')

  if (!filePart?.data) {
    throw createError({ statusCode: 400, message: 'Missing file field in form data' })
  }

  if (!filePart.filename || !/\.(xlsx|xls)$/i.test(filePart.filename)) {
    throw createError({ statusCode: 400, message: 'Invalid file type. Only .xlsx and .xls are allowed' })
  }

  const { excel } = useRuntimeConfig()

  if (filePart.data.length > excel.maxFileSize) {
    throw createError({ statusCode: 413, message: `File too large. Maximum size is ${excel.maxFileSize / 1024 / 1024} MB` })
  }

  // TODO: เปลี่ยนเป็น backendFetch จริงเมื่อ backend พร้อม
  // return await backendFetch<SettingsUploadResponse>(event, `/settings/upload/${type}`, {
  //   method: 'POST',
  //   body: filePart.data,
  //   headers: { 'Content-Type': filePart.type ?? 'application/octet-stream' },
  // })

  return {
    success: true,
    filename: filePart.filename,
    uploadedAt: new Date().toISOString(),
  }
})
