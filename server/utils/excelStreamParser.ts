import ExcelJS from 'exceljs'

interface ParseOptions {
  stream: NodeJS.ReadableStream
  sheetName?: string
  previewOnly?: boolean
  onRow?: (row: Record<string, any>, index: number) => void
}

export const streamParseExcel = async (options: ParseOptions) => {
  const { stream, sheetName = 'Data', previewOnly = false } = options
  const workbook = new ExcelJS.stream.xlsx.WorkbookReader(stream, {
    worksheets: 'emit',
    sharedStrings: 'cache',
    hyperlinks: 'ignore',
    styles: 'ignore',
  })

  let headers: string[] = []
  let rowCount = 0
  const sampleRows: any[] = []

  for await (const worksheet of workbook) {
    if ((worksheet as any).name !== sheetName) continue

    for await (const row of worksheet) {
      const values = Array.isArray(row.values) ? row.values.slice(1) : []

      if (row.number === 1) {
        headers = values.map((v: any) => String(v).trim())
        continue
      }

      rowCount++

      const rowData: Record<string, any> = {}
      headers.forEach((h, i) => {
        rowData[h] = values[i]
      })

      if (previewOnly && rowCount <= 100) {
        sampleRows.push({ row: rowCount, ...rowData })
      }

      if (options.onRow) {
        options.onRow(rowData, rowCount)
      }

      if (previewOnly && rowCount > 100) {
        break // read only 100 rows for preview
      }
    }
  }

  return {
    headers,
    totalParsed: rowCount,
    sampleRows,
  }
}
