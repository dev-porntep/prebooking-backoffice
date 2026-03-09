export default defineEventHandler(async () => {
  return {
    data: [
      { id: '1', createdAt: '2026-03-09 14:00', filters: 'ทั้งหมด', totalRows: 500, downloadUrl: '/api/export/download/1' },
      { id: '2', createdAt: '2026-03-08 10:30', filters: 'สถานะ: Pending', totalRows: 120, downloadUrl: '/api/export/download/2' },
      { id: '3', createdAt: '2026-03-07 09:15', filters: 'รุ่น: iPhone 16', totalRows: 85, downloadUrl: '/api/export/download/3' },
    ],
  }
})
