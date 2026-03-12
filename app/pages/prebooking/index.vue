<script setup lang="ts">
definePageMeta({ title: 'Booking List' })
useHead({ title: 'Booking List – Pre Booking' })

// ── Types ────────────────────────────────────────────
type StatusBooking = 'Success' | 'Pending' | 'Cancelled'
type StatusPayment = 'Success' | 'Pending'
type StatusDelivery = 'Success' | 'Pending'

interface BookingRow {
  id: string
  bookingNumber: string
  channel: string
  bookingDate: string
  customerName: string
  phone: string
  email: string
  receiptBooking: string
  receiptPayment: string
  shopBooking: string
  shopPickup: string
  pickupDate: string
  pickupTime: string
  productCode: string
  productName: string
  imei: string
  statusBooking: StatusBooking
  statusPayment: StatusPayment
  statusDelivery: StatusDelivery
}

// ── Mock data (matches Figma) ─────────────────────────
const mockRows: BookingRow[] = [
  {
    id: '1',
    bookingNumber: 'WW197225AYS559761',
    channel: 'shop',
    bookingDate: '01-01-2026 15:08',
    customerName: 'สมชาย เชียงใหม่',
    phone: '080-0000000',
    email: 'somchai2211@gmail.com',
    receiptBooking: '00479WWDP2505001100013',
    receiptPayment: '00479WWSS2506001102477',
    shopBooking: 'ทรูช้อป เทอร์มินอล 21 พัทยา',
    shopPickup: 'ทรูช้อป เทอร์มินอล 21 พัทยา',
    pickupDate: '09 มกราคม 2026',
    pickupTime: '13:00 - 15:00 น.',
    productCode: '3000113806',
    productName: 'H/S,VIVO,X200,5G,12+256,GREEN',
    imei: '861154077101775',
    statusBooking: 'Success',
    statusPayment: 'Pending',
    statusDelivery: 'Pending',
  },
  {
    id: '2',
    bookingNumber: 'WW197225AYS559762',
    channel: 'shop',
    bookingDate: '01-01-2026 15:08',
    customerName: 'สมชาย เชียงใหม่',
    phone: '080-0000000',
    email: 'somchai2211@gmail.com',
    receiptBooking: '00479WWDP2505001100013',
    receiptPayment: '00479WWSS2506001102477',
    shopBooking: 'ทรูช้อป เทอร์มินอล 21 พัทยา',
    shopPickup: 'ทรูช้อป เทอร์มินอล 21 พัทยา',
    pickupDate: '01 มกราคม 2026',
    pickupTime: '13:00 - 15:00 น.',
    productCode: '3000113806',
    productName: 'H/S,VIVO,X200,5G,12+256,GREEN',
    imei: '861154077101775',
    statusBooking: 'Cancelled',
    statusPayment: 'Pending',
    statusDelivery: 'Pending',
  },
  {
    id: '3',
    bookingNumber: 'WW197225AYS559763',
    channel: 'shop',
    bookingDate: '01-01-2026 15:08',
    customerName: 'สมชาย เชียงใหม่',
    phone: '080-0000000',
    email: 'somchai2211@gmail.com',
    receiptBooking: '00479WWDP2505001100013',
    receiptPayment: '00479WWSS2506001102477',
    shopBooking: 'ทรูช้อป เทอร์มินอล 21 พัทยา',
    shopPickup: 'ทรูช้อป เทอร์มินอล 21 พัทยา',
    pickupDate: '01 มกราคม 2026',
    pickupTime: '13:00 - 15:00 น.',
    productCode: '3000113806',
    productName: 'H/S,VIVO,X200,5G,12+256,GREEN',
    imei: '861154077101775',
    statusBooking: 'Success',
    statusPayment: 'Success',
    statusDelivery: 'Success',
  },
  {
    id: '4',
    bookingNumber: 'WW197225AYS559764',
    channel: 'shop',
    bookingDate: '01-01-2026 15:08',
    customerName: 'สมชาย เชียงใหม่',
    phone: '080-0000000',
    email: 'somchai2211@gmail.com',
    receiptBooking: '00479WWDP2505001100013',
    receiptPayment: '00479WWSS2506001102477',
    shopBooking: 'ทรูช้อป เทอร์มินอล 21 พัทยา',
    shopPickup: 'ทรูช้อป เทอร์มินอล 21 พัทยา',
    pickupDate: '01 มกราคม 2026',
    pickupTime: '13:00 - 15:00 น.',
    productCode: '3000113806',
    productName: 'H/S,VIVO,X200,5G,12+256,GREEN',
    imei: '861154077101775',
    statusBooking: 'Success',
    statusPayment: 'Success',
    statusDelivery: 'Pending',
  },
]

// ── Filters ──────────────────────────────────────────
const filterBookingNumber = ref('')
const filterShop = ref('')
const filterStatus = ref('')
const dateFrom = ref('01-01-2026')
const dateTo = ref('31-01-2026')

const filteredRows = computed(() => {
  return mockRows.filter((row) => {
    const matchNumber = !filterBookingNumber.value
      || row.bookingNumber.toLowerCase().includes(filterBookingNumber.value.toLowerCase())
    const matchShop = !filterShop.value
      || row.shopPickup.toLowerCase().includes(filterShop.value.toLowerCase())
    const matchStatus = !filterStatus.value
      || row.statusBooking.toLowerCase() === filterStatus.value.toLowerCase()
    return matchNumber && matchShop && matchStatus
  })
})

// ── Action dropdown ───────────────────────────────────
const openActionId = ref<string | null>(null)

function toggleAction(id: string) {
  openActionId.value = openActionId.value === id ? null : id
}

function closeAction() {
  openActionId.value = null
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', closeAction)
})
onUnmounted(() => {
  document.removeEventListener('click', closeAction)
})

// ── Status helpers ────────────────────────────────────
const statusStyle: Record<string, string> = {
  Success: 'bg-[rgba(58,151,76,0.1)] text-[#3A974C]',
  Pending: 'bg-[rgba(242,147,57,0.1)] text-[#F29339]',
  Cancelled: 'bg-[rgba(209,26,42,0.1)] text-[#D11A2A]',
}

const actions = [
  { label: 'ดูรายละเอียด', color: '#5B93FF', icon: 'i-lucide-file-text' },
  { label: 'ดูหน้าสั่งพิมพ์', color: '#0E98D8', icon: 'i-lucide-printer' },
  { label: 'ดู Log', color: '#3E47A2', icon: 'i-lucide-scroll-text' },
  { label: 'ยกเลิก Booking', color: '#E71D36', icon: 'i-lucide-x-circle' },
  { label: 'แก้ไข', color: '#F59E0B', icon: 'i-lucide-pencil' },
  { label: 'สั่งพิมพ์', color: '#3A5CF2', icon: 'i-lucide-printer' },
]
</script>

<template>
  <div @click.self="closeAction">
    <!-- Catch outside clicks on the wrapper -->
    <!-- ── Title row ────────────────────────────────────── -->
    <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-[#030229]">Booking List</h1>

      <!-- Date range -->
      <div class="flex items-center gap-2">
        <!-- Date From -->
        <div class="flex items-center gap-2 rounded-[10px] border border-[#E5E5E5] bg-white px-3 py-2">
          <input
            v-model="dateFrom"
            type="text"
            class="w-24 bg-transparent text-sm text-[#030229] outline-none"
            placeholder="DD-MM-YYYY"
          >
          <UIcon name="i-lucide-chevron-down" class="size-4 text-[#030229]/50" />
        </div>
        <span class="text-sm text-[#030229]/50">–</span>
        <!-- Date To -->
        <div class="flex items-center gap-2 rounded-[10px] bg-[#605BFF] px-3 py-2">
          <input
            v-model="dateTo"
            type="text"
            class="w-24 bg-transparent text-sm text-white outline-none placeholder:text-white/60"
            placeholder="DD-MM-YYYY"
          >
          <UIcon name="i-lucide-chevron-down" class="size-4 text-white" />
        </div>
      </div>
    </div>

    <!-- ── Filter row ───────────────────────────────────── -->
    <div class="mb-6 flex flex-wrap items-center gap-3">
      <!-- Booking number filter -->
      <input
        v-model="filterBookingNumber"
        type="text"
        placeholder="หมายเลข Booking"
        class="h-10 flex-1 min-w-[160px] rounded-[10px] border border-[#E5E5E5] bg-white px-4 text-sm text-[#030229] outline-none placeholder:text-[#030229]/30 focus:border-[#605BFF]"
      >
      <!-- Shop filter -->
      <input
        v-model="filterShop"
        type="text"
        placeholder="สาขาที่รับ / Shop"
        class="h-10 flex-1 min-w-[160px] rounded-[10px] border border-[#E5E5E5] bg-white px-4 text-sm text-[#030229] outline-none placeholder:text-[#030229]/30 focus:border-[#605BFF]"
      >
      <!-- Status filter -->
      <select
        v-model="filterStatus"
        class="h-10 flex-1 min-w-[140px] rounded-[10px] border border-[#E5E5E5] bg-white px-4 text-sm text-[#030229] outline-none focus:border-[#605BFF]"
      >
        <option value="">สถานะการจอง</option>
        <option value="Success">Success</option>
        <option value="Pending">Pending</option>
        <option value="Cancelled">Cancelled</option>
      </select>
      <!-- Search button -->
      <button class="h-10 shrink-0 rounded-[10px] bg-[#605BFF] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90">
        ค้นหา
      </button>
    </div>

    <!-- ── Table ────────────────────────────────────────── -->
    <!-- Desktop: horizontal scroll table -->
    <div class="w-full overflow-x-auto">
      <div class="min-w-[1100px] space-y-3">
        <!-- Column headers -->
        <div class="grid grid-cols-[220px_200px_200px_90px_90px_180px_90px_60px] gap-4 px-4 text-xs font-semibold text-[#030229]/50">
          <span>หมายเลขการจอง</span>
          <span>ชื่อลูกค้า</span>
          <span>ข้อมูล Shop</span>
          <span>การจอง</span>
          <span>การจ่ายมัดจำ</span>
          <span>ชื่อสินค้า</span>
          <span>การรับสินค้า</span>
          <span>Action</span>
        </div>

        <!-- Rows -->
        <div
          v-for="row in filteredRows"
          :key="row.id"
          class="relative grid grid-cols-[220px_200px_200px_90px_90px_180px_90px_60px] gap-4 rounded-[10px] bg-white px-4 py-4 items-start"
          style="box-shadow: 1px 17px 44px 0px rgba(3, 2, 41, 0.07);"
        >
          <!-- หมายเลขการจอง -->
          <div class="space-y-1 text-[11px] text-[#030229]/70">
            <p class="font-semibold text-[#5B93FF]">{{ row.bookingNumber }}</p>
            <p>ช่องทาง: {{ row.channel }}</p>
            <p>วันที่จอง: {{ row.bookingDate }}</p>
          </div>

          <!-- ชื่อลูกค้า -->
          <div class="space-y-0.5 text-[11px] text-[#030229]/70">
            <p class="font-semibold text-[#030229]">{{ row.customerName }}</p>
            <p>T: {{ row.phone }}</p>
            <p>M: {{ row.email }}</p>
            <div class="my-1 h-px bg-[#E5E5E5]" />
            <p>Receipt Booking:</p>
            <p class="text-[#0E98D8]">{{ row.receiptBooking }}</p>
            <p>Receipt Payment:</p>
            <p class="text-[#0E98D8]">{{ row.receiptPayment }}</p>
          </div>

          <!-- ข้อมูล Shop -->
          <div class="space-y-0.5 text-[11px] text-[#030229]/70">
            <p>จองที่: {{ row.shopBooking }}</p>
            <div class="my-1 h-px bg-[#E5E5E5]" />
            <p>รับที่: {{ row.shopPickup }}</p>
            <p>วันที่: {{ row.pickupDate }}</p>
            <p>เวลา: {{ row.pickupTime }}</p>
          </div>

          <!-- สถานะการจอง -->
          <div class="flex items-start">
            <span
              class="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold"
              :class="statusStyle[row.statusBooking]"
            >
              {{ row.statusBooking }}
            </span>
          </div>

          <!-- สถานะการจ่ายมัดจำ -->
          <div class="flex items-start">
            <span
              class="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold"
              :class="statusStyle[row.statusPayment]"
            >
              {{ row.statusPayment }}
            </span>
          </div>

          <!-- ชื่อสินค้า -->
          <div class="space-y-1.5 text-[11px] text-[#030229]/70">
            <p class="font-semibold text-[#404040]">{{ row.productCode }}</p>
            <p>{{ row.productName }}</p>
            <!-- IMEI pill -->
            <span class="inline-block rounded-full bg-[rgba(96,91,255,0.1)] px-2.5 py-0.5 text-[10px] font-semibold text-[#605BFF]">
              IMIE: {{ row.imei }}
            </span>
          </div>

          <!-- สถานะการรับสินค้า -->
          <div class="flex items-start">
            <span
              class="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold"
              :class="statusStyle[row.statusDelivery]"
            >
              {{ row.statusDelivery }}
            </span>
          </div>

          <!-- Action -->
          <div class="flex items-start justify-center">
            <div class="relative">
              <button
                class="flex size-8 items-center justify-center rounded-full text-[#030229]/50 transition-colors hover:bg-gray-100 hover:text-[#030229]"
                @click.stop="toggleAction(row.id)"
              >
                <UIcon name="i-lucide-more-vertical" class="size-4" />
              </button>

              <!-- Dropdown -->
              <div
                v-if="openActionId === row.id"
                class="absolute right-0 top-9 z-20 w-[110px] rounded-[10px] bg-white py-1.5 shadow-[0px_10px_20px_0px_rgba(0,0,0,0.1)]"
                @click.stop
              >
                <button
                  v-for="action in actions"
                  :key="action.label"
                  class="flex w-full items-center gap-2 px-3 py-1.5 text-[10px] font-normal transition-colors"
                  :style="`background: rgba(${action.color === '#5B93FF' ? '91,147,255' : action.color === '#0E98D8' ? '14,152,216' : action.color === '#3E47A2' ? '62,71,162' : action.color === '#E71D36' ? '231,29,54' : action.color === '#F59E0B' ? '245,158,11' : '58,92,242'},0.05)`"
                  :class="`text-[${action.color}]`"
                >
                  <span>{{ action.label }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="filteredRows.length === 0"
          class="rounded-[10px] bg-white py-16 text-center text-sm text-[#030229]/40"
          style="box-shadow: 1px 17px 44px 0px rgba(3, 2, 41, 0.07);"
        >
          ไม่พบข้อมูล
        </div>
      </div>
    </div>
  </div>
</template>
