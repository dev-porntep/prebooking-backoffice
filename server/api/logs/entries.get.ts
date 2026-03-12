import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'

export interface LogEntry {
  level:            string
  time:             string
  txid?:            string
  log_cat?:         string
  step_name?:       string
  endpoint?:        string
  method?:          string
  result_code?:     string
  result_indicator?: string
  elapsed_time?:    number
  step_request?:    string
  step_response?:   string
  msg:              string
  [key: string]: unknown
}

const PAGE_SIZE = 50
const MAX_FIELD_LENGTH = 2_000 // chars per large string field

const truncateLargeFields = (entry: LogEntry): LogEntry => {
  const result = { ...entry } as Record<string, unknown>
  for (const key in result) {
    if (typeof result[key] === 'string') {
      if (result[key].length > MAX_FIELD_LENGTH) {
        result[key] = `${result[key].slice(0, MAX_FIELD_LENGTH)}…[truncated]`
      }
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      try {
        const str = JSON.stringify(result[key])
        if (str.length > MAX_FIELD_LENGTH) {
          result[key] = `${str.slice(0, MAX_FIELD_LENGTH)}…[truncated JSON]`
        }
      } catch {
        result[key] = '[truncated object]'
      }
    }
  }
  return result as LogEntry
}

const readLines = (filePath: string): Promise<string[]> =>
  new Promise((resolve, reject) => {
    const lines: string[] = []
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    })
    rl.on('line', line => { if (line.trim()) lines.push(line) })
    rl.on('close', () => resolve(lines))
    rl.on('error', reject)
  })

const parseEntry = (raw: string): LogEntry | null => {
  try {
    return JSON.parse(raw) as LogEntry
  }
  catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const config  = useRuntimeConfig()
  const query   = getQuery(event)

  const logPath = config.logging?.logPath as string | undefined ?? 'logs/app'
  const logDir  = path.dirname(path.resolve(logPath))

  const fileName  = query['file'] as string | undefined
  const page      = Math.max(1, Number(query['page']) || 1)
  const level     = (query['level'] as string | undefined)?.toUpperCase()
  const search    = (query['search'] as string | undefined)?.toLowerCase()

  if (!fileName) {
    throw createError({ statusCode: 400, statusMessage: 'Missing file parameter' })
  }

  // Prevent directory traversal
  const resolved = path.resolve(logDir, path.basename(fileName))
  if (!resolved.startsWith(logDir)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file path' })
  }

  try {
    fs.accessSync(resolved, fs.constants.R_OK)
  }
  catch {
    throw createError({ statusCode: 404, statusMessage: 'Log file not found' })
  }

  const rawLines = await readLines(resolved)
  let entries = rawLines.map(parseEntry).filter((e): e is LogEntry => e !== null)

  // Filter by level
  if (level && level !== 'ALL') {
    entries = entries.filter(e => e.level?.toUpperCase() === level)
  }

  // Filter by search (endpoint or txid or step_name)
  if (search) {
    entries = entries.filter(e =>
      e.endpoint?.toLowerCase().includes(search)
      || e.txid?.toLowerCase().includes(search)
      || e.step_name?.toLowerCase().includes(search)
      || e.msg?.toLowerCase().includes(search)
      || e.method?.toLowerCase().includes(search)
      || e.result_code?.toLowerCase().includes(search)
      || e.result_indicator?.toLowerCase().includes(search),
    )
  }

  // Reverse so newest first
  entries = [...entries].reverse()

  const total      = entries.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const offset     = (page - 1) * PAGE_SIZE
  const data       = entries.slice(offset, offset + PAGE_SIZE).map(truncateLargeFields)

  return { data, total, page, totalPages, pageSize: PAGE_SIZE }
})
