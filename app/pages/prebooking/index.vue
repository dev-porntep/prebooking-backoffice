<script setup lang="ts">
import type { BookingRow } from '~/types/bookingList'

definePageMeta({ title: 'Booking List' })
useHead({ title: 'Booking List – Pre Booking' })

const { t } = useI18n()

// ── Mock data (replace with real API via usePrebooking composable) ────────────
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

// ── Filters ───────────────────────────────────────────────────────────────────
const filterBookingNumber = ref('')
const filterShop = ref('')
const filterStatus = ref('')
const dateFrom = ref('01-01-2026')
const dateTo = ref('31-01-2026')

const filteredRows = computed(() =>
  mockRows.filter((row) => {
    const matchNumber = !filterBookingNumber.value
      || row.bookingNumber.toLowerCase().includes(filterBookingNumber.value.toLowerCase())
    const matchShop = !filterShop.value
      || row.shopPickup.toLowerCase().includes(filterShop.value.toLowerCase())
    const matchStatus = !filterStatus.value
      || row.statusBooking.toLowerCase() === filterStatus.value.toLowerCase()
    return matchNumber && matchShop && matchStatus
  }),
)

// ── Action dropdown ───────────────────────────────────────────────────────────
const openActionId = ref<string | null>(null)

function toggleAction(id: string): void {
  openActionId.value = openActionId.value === id ? null : id
}

function closeAction(): void {
  openActionId.value = null
}

onMounted(() => document.addEventListener('click', closeAction))
onUnmounted(() => document.removeEventListener('click', closeAction))
</script>

<template>
  <div @click.self="closeAction">
    <!-- Title row -->
    <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-[#030229]">
        {{ t('prebooking.pageTitle') }}
      </h1>
      <BookingDateRangePicker
        v-model:model-from="dateFrom"
        v-model:model-to="dateTo"
      />
    </div>

    <!-- Filter row -->
    <BookingFilterBar
      v-model:model-booking-number="filterBookingNumber"
      v-model:model-shop="filterShop"
      v-model:model-status="filterStatus"
    />

    <!-- Table -->
    <div class="w-full overflow-x-auto">
      <div class="min-w-[1100px] space-y-3">
        <!-- Column headers -->
        <div class="grid grid-cols-[220px_200px_200px_90px_90px_180px_90px_60px] gap-4 px-4 text-xs font-semibold text-[#030229]/70">
          <span>{{ t('prebooking.list.col.bookingNumber') }}</span>
          <span>{{ t('prebooking.list.col.customer') }}</span>
          <span>{{ t('prebooking.list.col.shop') }}</span>
          <span>{{ t('prebooking.list.col.statusBooking') }}</span>
          <span>{{ t('prebooking.list.col.statusPayment') }}</span>
          <span>{{ t('prebooking.list.col.product') }}</span>
          <span>{{ t('prebooking.list.col.statusDelivery') }}</span>
          <span>{{ t('prebooking.list.col.action') }}</span>
        </div>

        <!-- Rows -->
        <BookingTableRow
          v-for="row in filteredRows"
          :key="row.id"
          :row="row"
          :is-action-open="openActionId === row.id"
          @toggle-action="toggleAction(row.id)"
          @close-action="closeAction"
        />

        <!-- Empty state -->
        <BookingEmptyState v-if="filteredRows.length === 0" />
      </div>
    </div>
  </div>
</template>
