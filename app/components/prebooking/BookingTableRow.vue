<script setup lang="ts">
import type { BookingRow } from '~/types/bookingList'
import { BOOKING_ACTIONS, STATUS_STYLE } from '~/utils/bookingConstants'
import { hexToRgba } from '~/utils/hexToRgba'

interface Props {
  row: BookingRow
  isActionOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  toggleAction: []
  closeAction: []
}>()

const { t } = useI18n()
</script>

<template>
  <div
    class="relative grid grid-cols-[220px_200px_200px_90px_90px_180px_90px_60px] items-start gap-4 rounded-[10px] bg-white px-4 py-4"
    style="box-shadow: 1px 17px 44px 0px rgba(3, 2, 41, 0.07);"
  >
    <!-- หมายเลขการจอง -->
    <div class="space-y-1 text-xs text-[#030229]/70">
      <p class="font-semibold text-[#5B93FF]">{{ row.bookingNumber }}</p>
      <p>{{ t('prebooking.list.row.channel') }}: {{ row.channel }}</p>
      <p>{{ t('prebooking.list.row.bookingDate') }}: {{ row.bookingDate }}</p>
    </div>

    <!-- ชื่อลูกค้า -->
    <div class="space-y-0.5 text-xs text-[#030229]/70">
      <p class="font-semibold text-[#030229]">{{ row.customerName }}</p>
      <p>{{ t('prebooking.list.row.phone') }}: {{ row.phone }}</p>
      <p>{{ t('prebooking.list.row.email') }}: {{ row.email }}</p>
      <div class="my-1 h-px bg-[#E5E5E5]" />
      <p>{{ t('prebooking.list.row.receiptBooking') }}:</p>
      <p class="text-[#0E98D8]">{{ row.receiptBooking }}</p>
      <p>{{ t('prebooking.list.row.receiptPayment') }}:</p>
      <p class="text-[#0E98D8]">{{ row.receiptPayment }}</p>
    </div>

    <!-- ข้อมูล Shop -->
    <div class="space-y-0.5 text-xs text-[#030229]/70">
      <p>{{ t('prebooking.list.row.bookedAt') }}: {{ row.shopBooking }}</p>
      <div class="my-1 h-px bg-[#E5E5E5]" />
      <p>{{ t('prebooking.list.row.pickupAt') }}: {{ row.shopPickup }}</p>
      <p>{{ t('prebooking.list.row.date') }}: {{ row.pickupDate }}</p>
      <p>{{ t('prebooking.list.row.time') }}: {{ row.pickupTime }}</p>
    </div>

    <!-- สถานะการจอง -->
    <div class="flex items-start">
      <span
        class="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-normal"
        :class="STATUS_STYLE[row.statusBooking]"
      >
        {{ row.statusBooking }}
      </span>
    </div>

    <!-- สถานะการจ่ายมัดจำ -->
    <div class="flex items-start">
      <span
        class="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-normal"
        :class="STATUS_STYLE[row.statusPayment]"
      >
        {{ row.statusPayment }}
      </span>
    </div>

    <!-- ชื่อสินค้า -->
    <div class="space-y-1.5 text-xs text-[#030229]/70">
      <p class="font-semibold text-[#404040]">{{ row.productCode }}</p>
      <p>{{ row.productName }}</p>
      <span class="inline-block rounded-full bg-[#605BFF] px-2.5 py-0.5 text-xs font-bold text-white">
        {{ t('prebooking.list.row.imeiPrefix') }}: {{ row.imei }}
      </span>
    </div>

    <!-- สถานะการรับสินค้า -->
    <div class="flex items-start">
      <span
        class="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-normal"
        :class="STATUS_STYLE[row.statusDelivery]"
      >
        {{ row.statusDelivery }}
      </span>
    </div>

    <!-- Action -->
    <div class="flex items-start justify-center">
      <div class="relative">
        <button
          class="flex size-8 items-center justify-center rounded-full text-[#030229]/50 transition-colors hover:bg-gray-100 hover:text-[#030229]"
          @click.stop="emit('toggleAction')"
        >
          <UIcon name="i-lucide-more-vertical" class="size-4" />
        </button>

        <div
          v-if="isActionOpen"
          class="absolute right-0 top-9 z-20 w-[110px] rounded-[10px] bg-white py-1.5 shadow-[0px_10px_20px_0px_rgba(0,0,0,0.1)]"
          @click.stop
        >
          <button
            v-for="action in BOOKING_ACTIONS"
            :key="action.labelKey"
            class="flex w-full items-center gap-2 px-3 py-1.5 text-[10px] font-normal transition-colors"
            :style="{ background: hexToRgba(action.color, 0.05), color: action.color }"
          >
            <UIcon :name="action.icon" class="size-3 shrink-0" />
            <span>{{ t(action.labelKey) }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
