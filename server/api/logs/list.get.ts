import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const logPath = config.logging?.logPath as string | undefined ?? 'logs/app'
  const logDir = path.dirname(path.resolve(logPath))

  try {
    fs.accessSync(logDir, fs.constants.R_OK)
  }
  catch {
    return { files: [] }
  }

  const entries = fs.readdirSync(logDir, { withFileTypes: true })
  const files = entries
    .filter(e => e.isFile() && e.name.endsWith('.log'))
    .map(e => ({
      name:     e.name,
      path:     path.join(logDir, e.name),
      sizeBytes: fs.statSync(path.join(logDir, e.name)).size,
      modifiedAt: fs.statSync(path.join(logDir, e.name)).mtime.toISOString(),
    }))
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))

  return { files }
})
