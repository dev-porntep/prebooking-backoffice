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

  const sheet = workbook.addWorksheet('Quota Template', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  sheet.columns = [
    { header: 'mat_code', key: 'mat_code', width: 18 },
    { header: 'product_name', key: 'product_name', width: 28 },
    { header: 'color', key: 'color', width: 16 },
    { header: 'storage', key: 'storage', width: 14 },
    { header: 'branch_code', key: 'branch_code', width: 16 },
    { header: 'quota', key: 'quota', width: 10 },
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
    mat_code: 'MAT-001',
    product_name: 'iPhone 16 Pro',
    color: 'Black Titanium',
    storage: '256GB',
    branch_code: 'BKK-001',
    quota: 50,
  })

  // Add note row
  const noteRow = sheet.addRow(['* ลบแถวตัวอย่างนี้ก่อน Import จริง'])
  noteRow.getCell(1).font = { italic: true, color: { argb: 'FF888888' }, size: 9 }
  sheet.mergeCells(`A${noteRow.number}:F${noteRow.number}`)

  const buffer = await workbook.xlsx.writeBuffer()

  setHeaders(event, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': 'attachment; filename="quota-template.xlsx"',
  })

  return buffer
})
