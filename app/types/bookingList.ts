export type StatusBooking = 'Success' | 'Pending' | 'Cancelled'
export type StatusPayment = 'Success' | 'Pending'
export type StatusDelivery = 'Success' | 'Pending'

export interface BookingRow {
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
