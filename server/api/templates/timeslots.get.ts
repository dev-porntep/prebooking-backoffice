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

  const sheet = workbook.addWorksheet('Timeslots Template', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  sheet.columns = [
    { header: 'branch_code', key: 'branch_code', width: 16 },
    { header: 'date', key: 'date', width: 16 },
    { header: 'start_time', key: 'start_time', width: 14 },
    { header: 'end_time', key: 'end_time', width: 14 },
    { header: 'capacity', key: 'capacity', width: 12 },
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

  // Sample data rows
  sheet.addRow({ branch_code: 'BKK-001', date: '2026-03-20', start_time: '09:00', end_time: '10:00', capacity: 10 })
  sheet.addRow({ branch_code: 'BKK-001', date: '2026-03-20', start_time: '10:00', end_time: '11:00', capacity: 10 })

  // Format note
  const noteRow = sheet.addRow(['* วันที่: YYYY-MM-DD | เวลา: HH:MM (24hr) | ลบแถวตัวอย่างก่อน Import จริง'])
  noteRow.getCell(1).font = { italic: true, color: { argb: 'FF888888' }, size: 9 }
  sheet.mergeCells(`A${noteRow.number}:E${noteRow.number}`)

  const buffer = await workbook.xlsx.writeBuffer()

  setHeaders(event, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': 'attachment; filename="timeslots-template.xlsx"',
  })

  return buffer
})
