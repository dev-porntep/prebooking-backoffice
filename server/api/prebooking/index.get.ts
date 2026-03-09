export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // TODO: เปลี่ยนเป็น backendFetch ตอนต่อ backend จริง
  // return await backendFetch(event, '/prebookings', { query })

  // Mock response
  return {
    data: [
      { id: '1', customerName: 'สมชาย มานะ', phoneNumber: '0891234567', deviceModel: 'iPhone 16 Pro', deviceColor: 'Titanium Black', storage: '256GB', quantity: 1, preferredBranch: 'สาขาสยามพารากอน', prebookingDate: '2026-03-15', depositAmount: 5000, status: 'confirmed', createdAt: '2026-03-01', updatedAt: '2026-03-01' },
      { id: '2', customerName: 'สมหญิง รักดี', phoneNumber: '0911234567', deviceModel: 'Samsung S25 Ultra', deviceColor: 'Titanium Blue', storage: '512GB', quantity: 1, preferredBranch: 'สาขาเซ็นทรัลเวิลด์', prebookingDate: '2026-03-16', depositAmount: 3000, status: 'pending', createdAt: '2026-03-02', updatedAt: '2026-03-02' },
      { id: '3', customerName: 'สมศรี ใจดี', phoneNumber: '0651234567', deviceModel: 'iPhone 16', deviceColor: 'Blue', storage: '128GB', quantity: 2, preferredBranch: 'สาขาเมกาบางนา', prebookingDate: '2026-03-14', depositAmount: 0, status: 'cancelled', createdAt: '2026-03-03', updatedAt: '2026-03-05' },
    ],
    total: 500,
    page: Number(query['page']) || 1,
    limit: Number(query['limit']) || 20,
    totalPages: 25,
  }
})
