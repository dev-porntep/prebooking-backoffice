import ExcelJS from 'exceljs'

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFE2231A' },
}

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: 'FFFFFFFF' },
  size: 11,
}

const HEADER_ALIGNMENT: Partial<ExcelJS.Alignment> = {
  vertical: 'middle',
  horizontal: 'center',
}

export default defineEventHandler(async (event) => {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Prebooking Back Office'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Dates Template', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  sheet.columns = [
    { header: 'prebooking_date', key: 'prebooking_date', width: 20 },
    { header: 'pickup_date', key: 'pickup_date', width: 20 },
    { header: 'branch_code', key: 'branch_code', width: 16 },
  ]

  // Style header row
  const headerRow = sheet.getRow(1)
  headerRow.height = 24
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = HEADER_ALIGNMENT
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFCC1811' } },
    }
  })

  // Sample data row
  sheet.addRow({
    prebooking_date: '2026-03-15',
    pickup_date: '2026-03-20',
    branch_code: 'BKK-001',
  })

  // Format note
  const noteRow = sheet.addRow(['* รูปแบบวันที่ต้องเป็น YYYY-MM-DD เช่น 2026-03-15 | ลบแถวตัวอย่างก่อน Import จริง'])
  noteRow.getCell(1).font = { italic: true, color: { argb: 'FF888888' }, size: 9 }
  sheet.mergeCells(`A${noteRow.number}:C${noteRow.number}`)

  const buffer = await workbook.xlsx.writeBuffer()

  setHeaders(event, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': 'attachment; filename="dates-template.xlsx"',
  })

  return buffer
})
