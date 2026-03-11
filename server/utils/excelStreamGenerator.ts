import ExcelJS from 'exceljs'
import { PassThrough } from 'node:stream'

interface GenerateOptions {
  headers: string[]
  dataFetcher: (page: number, limit: number) => Promise<Record<string, unknown>[]>
  onProgress?: (processed: number) => void
}

export const streamGenerateExcel = async (options: GenerateOptions) => {
  const { headers, dataFetcher, onProgress } = options
  const stream = new PassThrough()
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream })
  const worksheet = workbook.addWorksheet('Export Data')

  // Set headers
  worksheet.columns = headers.map(h => ({ header: h, key: h, width: 20 }))

  let page = 1
  const limit = 1000
  let totalProcessed = 0
  let hasMore = true

  // Fetch and write in chunks
  while (hasMore) {
    const data = await dataFetcher(page, limit)
    if (data.length === 0) {
      hasMore = false
      break
    }

    data.forEach(row => {
      worksheet.addRow(row).commit()
    })

    totalProcessed += data.length
    if (onProgress) onProgress(totalProcessed)

    page++
  }

  worksheet.commit()
  await workbook.commit()

  return stream
}
