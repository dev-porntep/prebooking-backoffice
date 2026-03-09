import ExcelJS from 'exceljs'
import { join } from 'path'
import { mkdirSync, existsSync } from 'fs'

const generateTemplate = async () => {
  const workbook = new ExcelJS.Workbook()

  // Sheet 1: Data
  const sheet = workbook.addWorksheet('Data')
  
  sheet.columns = [
    { header: 'customer_name', key: 'customerName', width: 25 },
    { header: 'phone_number', key: 'phoneNumber', width: 15 },
    { header: 'email', key: 'email', width: 25 },
    { header: 'device_model', key: 'deviceModel', width: 20 },
    { header: 'device_color', key: 'deviceColor', width: 20 },
    { header: 'storage', key: 'storage', width: 15 },
    { header: 'quantity', key: 'quantity', width: 10 },
    { header: 'preferred_branch', key: 'preferredBranch', width: 25 },
    { header: 'prebooking_date', key: 'prebookingDate', width: 15 },
    { header: 'deposit_amount', key: 'depositAmount', width: 15 },
    { header: 'notes', key: 'notes', width: 30 },
  ]

  // Add sample row
  sheet.addRow({
    customerName: 'สมชาย มานะ (ตัวอย่าง)',
    phoneNumber: '0891234567',
    email: 'somchai@example.com',
    deviceModel: 'iPhone 16 Pro',
    deviceColor: 'Titanium Black',
    storage: '256GB',
    quantity: 1,
    preferredBranch: 'สาขาสยามพารากอน',
    prebookingDate: '2026-03-15',
    depositAmount: 5000,
    notes: 'ตัวอย่างข้อมูล',
  })

  // Format header row (bold, background color)
  sheet.getRow(1).font = { bold: true }
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  }

  // Sheet 2: กติกาการกรอกข้อมูล
  const helpSheet = workbook.addWorksheet('Instructions')
  helpSheet.columns = [
    { header: 'คอลัมน์', key: 'col', width: 20 },
    { header: 'คำอธิบาย', key: 'desc', width: 50 },
    { header: 'รูปแบบ', key: 'format', width: 30 },
  ]

  const instructions = [
    { col: 'customer_name', desc: 'ชื่อ-นามสกุลลูกค้า (บังคับ)', format: 'ข้อความ' },
    { col: 'phone_number', desc: 'เบอร์ติดต่อ 10 หลัก (บังคับ)', format: 'ตัวเลข (0xx...)' },
    { col: 'email', desc: 'อีเมลลูกค้า (เผื่อส่งใบเสร็จ)', format: 'อีเมล' },
    { col: 'device_model', desc: 'รุ่นมือถือ (บังคับ ต้องตรงกับ Master List)', format: 'ดูในชีตข้างเคียง' },
    { col: 'quantity', desc: 'จำนวนเครื่องที่จอง (บังคับ)', format: 'ตัวเลข' },
  ]

  helpSheet.addRows(instructions)

  // Ensure public/templates dir exists
  const publicDir = join(process.cwd(), 'public', 'templates')
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true })
  }

  // Write file
  const filePath = join(publicDir, 'prebooking-template.xlsx')
  await workbook.xlsx.writeFile(filePath)
  console.log('Template created successfully at:', filePath)
}

generateTemplate().catch(console.error)
