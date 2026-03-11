const STEP_NAME_MAP: Readonly<Record<string, string>> = {
  '/api/prebooking':          'LIST_PREBOOKINGS',
  '/api/prebooking/:id':      'GET_PREBOOKING',
  '/api/import/upload':       'IMPORT_UPLOAD',
  '/api/import/process':      'IMPORT_PROCESS',
  '/api/import/status':       'IMPORT_STATUS',
  '/api/import/status/:id':   'IMPORT_STATUS',
  '/api/export/generate':     'EXPORT_GENERATE',
  '/api/export/history':      'EXPORT_HISTORY',
  '/api/templates/quota':     'TEMPLATE_QUOTA',
  '/api/templates/dates':     'TEMPLATE_DATES',
  '/api/templates/timeslots': 'TEMPLATE_TIMESLOTS',
  '/api/auth/sso':            'AUTH_SSO',
  '/api/auth/callback':       'AUTH_CALLBACK',
} as const

const UUID_PATTERN = /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
const NUMERIC_SEGMENT_PATTERN = /\/\d+(?=\/|$)/g

const normalizePath = (path: string): string => {
  const withoutQuery = path.split('?')[0] ?? path
  return withoutQuery
    .replace(UUID_PATTERN, '/:id')
    .replace(NUMERIC_SEGMENT_PATTERN, '/:id')
    .toLowerCase()
}

export const resolveStepName = (
  activity: string,
  endpoint?: string,
  method?: string,
): string => {
  const target = endpoint ?? activity
  const normalized = normalizePath(target)

  const mapped = STEP_NAME_MAP[normalized]
  if (mapped) return method ? `${method.toUpperCase()}_${mapped}` : mapped

  return target
    .toUpperCase()
    .replace(/\?.*$/, '')
    .replace(/\//g, '_')
    .replace(/^_/, '')
    .replace(/[^A-Z0-9_]/g, '')
}
