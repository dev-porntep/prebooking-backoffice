export const STATUS_STYLE: Readonly<Record<string, string>> = Object.freeze({
  Success: 'bg-[rgba(58,151,76,0.1)] text-[#3A974C]',
  Pending: 'bg-[rgba(242,147,57,0.1)] text-[#F29339]',
  Cancelled: 'bg-[rgba(209,26,42,0.1)] text-[#D11A2A]',
})

export interface BookingAction {
  readonly labelKey: string
  readonly color: string
  readonly icon: string
}

export const BOOKING_ACTIONS: ReadonlyArray<BookingAction> = Object.freeze([
  { labelKey: 'prebooking.actions.viewDetail', color: '#5B93FF', icon: 'i-lucide-file-text' },
  { labelKey: 'prebooking.actions.viewPrint', color: '#0E98D8', icon: 'i-lucide-printer' },
  { labelKey: 'prebooking.actions.viewLog', color: '#3E47A2', icon: 'i-lucide-scroll-text' },
  { labelKey: 'prebooking.actions.cancelBooking', color: '#E71D36', icon: 'i-lucide-x-circle' },
  { labelKey: 'prebooking.actions.edit', color: '#F59E0B', icon: 'i-lucide-pencil' },
  { labelKey: 'prebooking.actions.print', color: '#3A5CF2', icon: 'i-lucide-printer' },
])
